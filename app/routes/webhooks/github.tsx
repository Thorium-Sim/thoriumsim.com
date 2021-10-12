import {
  ActionFunction,
  LoaderFunction,
  redirect,
  json,
  useActionData,
  useLoaderData,
} from "remix";

const betaHeader = {
  "GraphQL-Features": "projects_next_graphql",
  authorization: `bearer ${process.env.GITHUB_TOKEN}`,
};
const projectDataQuery = `query($org: String!, $number: Int!) {
  organization(login: $org){
    projectNext(number: $number) {
      id
      fields(first:20) {
        nodes {
          id
          name
          settings
        }
      }
    }
  }
}`;

const addToProjectMutation = `mutation($project:ID!, $item:ID!) {
  addProjectNextItem(input: {projectId: $project, contentId: $item}) {
    projectNextItem {
      id
    }
  }
}`;

const setStatusMutation = `mutation (
  $project: ID!
  $item: ID!
  $status_field: ID!
  $status_value: String!
) {
  set_status: updateProjectNextItemField(input: {
    projectId: $project
    itemId: $item
    fieldId: $status_field
    value: $status_value
  }) {
    projectNextItem {
      id
      }
  }
}`;

const deleteItemMutation = `mutation($project:ID!, $item:ID!) {
  deleteProjectNextItem(input: {projectId: $project itemId: $item}) {
    deletedItemId
  }
}`;

const addLabelMutation = `mutation($item:ID!, $label:ID!) {
  addLabelsToLabelable(input:{
    labelableId:$item,
    labelIds:[$label]
  }) {
    clientMutationId
  }
}`;
const org = "thorium-sim";
const projectNumber = 2;

function runQuery(query: string, variables: Record<string, any>): Promise<any> {
  return fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: betaHeader,
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then(r => r.json());
}

type StatusNames =
  | "⏳Pending Approval"
  | "📌 Todo"
  | "🛠 In Progress"
  | "🧐 Review Requested"
  | "🤙 Reviewer Approved"
  | "✅ Done";
export const action: ActionFunction = async ({request}) => {
  try {
    const body = await request.json();
    const projectData = await runQuery(projectDataQuery, {
      org,
      number: projectNumber,
    });

    const projectId = projectData.data.organization.projectNext.id;
    const fields = projectData.data.organization.projectNext.fields.nodes;
    const statusField = fields.find(
      (field: {name: string; id: string}) => field.name === "Status"
    );
    const statusSettings = JSON.parse(statusField.settings).reduce(
      (
        prev: Record<StatusNames, string>,
        next: {id: string; name: StatusNames}
      ) => {
        prev[next.name] = next.id;
      },
      {}
    );

    async function addToProject(nodeId: string) {
      return runQuery(addToProjectMutation, {
        project: projectId,
        item: nodeId,
      });
    }
    async function setStatus(nodeId: string, status: string) {
      return runQuery(setStatusMutation, {
        project: projectId,
        item: nodeId,
        status_field: statusField.id,
        status_value: status,
      });
    }
    async function deleteItem(nodeId: string) {
      return runQuery(deleteItemMutation, {
        project: projectId,
        item: nodeId,
      });
    }
    async function addApprovedLabel(nodeId: string) {
      return runQuery(addLabelMutation, {
        item: nodeId,
        label: "approved",
      });
    }
    if (body.issue) {
      const {node_id, labels, assignee} = body.issue;
      const hasApproved = labels.some(
        (label: {name: string}) => label.name === "approved"
      );
      const isAssigned = !!assignee?.id;
      switch (body.action) {
        case "opened":
          // Add it to the pending approval column
          // unless it has the 'approved' label
          await addToProject(node_id);
          if (hasApproved) {
            await setStatus(node_id, statusSettings["📌 Todo"]);
          } else {
            await setStatus(node_id, statusSettings["⏳Pending Approval"]);
          }
          break;
        case "closed":
          // If it has the 'approved' label, move it to
          // the done column
          // Otherwise, remove it from the project
          if (hasApproved) {
            await setStatus(node_id, statusSettings["✅ Done"]);
          } else {
            await deleteItem(node_id);
          }
          break;
        case "reopened":
          // If it has the 'approved' label, and is
          // assigned to someone, move it to the
          // in-progress column
          // Otherwise, move it to the todo column
          // If it does not have the 'approved' label,
          // add it to the project and put it in the 'Pending approval' column
          if (hasApproved && isAssigned) {
            await setStatus(node_id, statusSettings["🛠 In Progress"]);
          } else if (hasApproved) {
            await setStatus(node_id, statusSettings["📌 Todo"]);
          } else {
            await addToProject(node_id);
            await setStatus(node_id, statusSettings["⏳Pending Approval"]);
          }
          break;
        case "labeled":
          if (body.label.name === "approved") {
            // Move it to the todo column
            await setStatus(node_id, statusSettings["📌 Todo"]);
          }
          break;
        case "unlabeled":
          if (body.label.name === "approved") {
            // Move it to the pending approval column
            await setStatus(node_id, statusSettings["⏳Pending Approval"]);
          }
          break;
        case "assigned":
          // Move it to the in-progress column
          // Give it the 'approved' label
          await setStatus(node_id, statusSettings["🛠 In Progress"]);
          await addApprovedLabel(node_id);
          break;
        case "unassigned":
          // Move it to the todo column
          await setStatus(node_id, statusSettings["📌 Todo"]);
          break;
        default:
          break;
      }
    } else if (body.pull_request && body.review) {
      const {node_id} = body.pull_request;
      if (body.review.state.toLowerCase() === "approved") {
        // Move it to the approved column
        await setStatus(node_id, statusSettings["🤙 Reviewer Approved"]);
      }
    } else if (body.pull_request) {
      const {node_id} = body.pull_request;
      switch (body.action) {
        case "opened":
          // Add it to the In Progress column
          await addToProject(node_id);
          await setStatus(node_id, statusSettings["🛠 In Progress"]);
          break;
        case "closed":
          // If it is merged, move it to the done column
          // Otherwise, remove it from the project
          if (body.pull_request.merged) {
            await setStatus(node_id, statusSettings["✅ Done"]);
          } else {
            await deleteItem(node_id);
          }
          break;
        case "reopened":
          // Add it to the In Progress column
          await addToProject(node_id);
          await setStatus(node_id, statusSettings["🛠 In Progress"]);

          break;
        case "ready_for_review":
          // Add it to the Review Requested column
          await setStatus(node_id, statusSettings["🧐 Review Requested"]);
          break;
        case "review_requested":
          // Add it to the Review Requested column
          await setStatus(node_id, statusSettings["🧐 Review Requested"]);
          break;
        case "converted_to_draft":
          await setStatus(node_id, statusSettings["🛠 In Progress"]);
          break;
        case "review_request_removed":
          await setStatus(node_id, statusSettings["🛠 In Progress"]);
          break;
        default:
          break;
      }
    }
    return json({success: true}, {status: 200});
  } catch (err) {
    console.error(err);
    return json({success: false}, {status: 400});
  }
};

// export const loader: LoaderFunction = async () => {
//   return redirect("/");
// };

export let handle = {
  api_only: true,
};

export let headers = () => ({"content-type": "application/json"});

export default function Newsletter() {
  const actionData = useActionData();
  return encodeURIComponent(JSON.stringify(actionData));
}
