import * as React from "react";
import ReactMde, {ChildProps, SaveImageHandler} from "@thorium-sim/react-mde";
export {default as styles} from "./MarkdownInput.css";

export default function MarkdownInput({
  saveImage,
  value = "",
  setValue,
  ...props
}: ChildProps["textArea"] & {
  saveImage?: SaveImageHandler;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <ReactMde
      value={value}
      onChange={setValue}
      selectedTab="write"
      onTabChange={() => {}}
      childProps={{
        writeButton: {
          tabIndex: -1,
        },
        textArea: {...props, form: undefined},
      }}
      classes={{
        preview: "prose",
        reactMde: "no-preview",
      }}
      generateMarkdownPreview={async markdown => {
        const {Markdown: processMarkdown} = await import(
          "../helpers/processMarkdown"
        );
        return processMarkdown({input: markdown});
      }}
      paste={saveImage ? {saveImage} : undefined}
    />
  );
}
