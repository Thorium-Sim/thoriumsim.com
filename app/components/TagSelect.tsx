import {Dispatch, Fragment, SetStateAction, useState} from "react";
import {Listbox, Transition} from "@headlessui/react";
import {HiCheck, HiSelector} from "react-icons/hi";

export default function TagSelect<T extends {tag: string}>({
  tags,
  selected,
  setSelected,
}: {
  tags: T[];
  selected: T[];
  setSelected: Dispatch<SetStateAction<T[]>>;
}) {
  return (
    <Listbox
      value={selected}
      onChange={(item: any) =>
        setSelected(selected =>
          selected.find(s => s.tag === item.tag)
            ? selected.filter(s => s.tag !== item.tag)
            : selected.concat(item)
        )
      }
    >
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-tgray-700 rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
          <span className="block truncate h-4">
            {selected.map(s => s.tag).join(", ")}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <HiSelector className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-tgray-700 rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {tags.map((tag, tagIdx) => (
              <Listbox.Option
                key={tagIdx}
                className={() =>
                  `${
                    selected.find(s => s.tag === tag.tag)
                      ? "text-gray-100 bg-tgray-400"
                      : "text-white"
                  }
                          cursor-default select-none relative py-2 pl-10 pr-4`
                }
                value={tag}
              >
                {({selected, active}) => (
                  <>
                    <span
                      className={`${
                        selected ? "font-medium" : "font-normal"
                      } block truncate`}
                    >
                      {tag.tag}
                    </span>
                    {selected ? (
                      <span
                        className={`${
                          active ? "text-cerise-600" : "text-cerise-600"
                        }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                      >
                        <HiCheck className="w-5 h-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
