import React from "react";
import styles from "./GenericInputWrapper.module.css";
import { v4 as uuidV4 } from "uuid";

type InputAttributeProps = {
  type?: "input" | "checkbox" | "radio" | "tel" | "email";
  pattern?: string;
  maxLength?: number;
  rows?: number;
  value?: string | number;
  required?: boolean;
  name?: string;
  placeholder?: string;
};
type InputProps = {
  label: string;
  id: string;
  attributes?: InputAttributeProps;
};

const GenericInput: React.FC<InputProps> = ({ id, label, attributes }) => {
  return (
    <>
      <input
        id={id}
        {...attributes}
      />
      <label htmlFor={id}>
        <span className={styles.labelTextWrapper}>{label}</span>
      </label>
    </>
  );
};

const TextArea: React.FC<InputProps> = ({ id, label, attributes }) => {
  return (
    <>
      <textarea
        id={id}
        {...attributes}
      />
      <label htmlFor={id}>
        <span className={styles.labelTextWrapper}>{label}</span>
      </label>
    </>
  );
};

type RadioProps = {
  required: boolean; // TODO: maybe move this to generic level
  radios: { label: string; attributes?: InputAttributeProps }[];
};
const Radio: React.FC<InputProps & RadioProps> = ({ label, radios }) => {
  const requiredInput = radios.reduce((a, b) => {
    return !!(a && b.attributes?.required);
  }, true);
  return (
    <>
      <span
        data-cw-input-required={requiredInput}
        className={styles.radioInputLabel}
      >
        {label}
      </span>
      <div className={styles.radioInputGroup}>
        {radios.map((radio) => {
          const id = uuidV4();
          return (
            <div key={id}>
              <GenericInput
                id={id}
                {...radio}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

/**
 * Object that maps to all the input types
 */
const Inputs: {
  [key: string]: (
    props: InputProps | (InputProps & RadioProps)
  ) => React.JSX.Element;
} = {
  input: (props: InputProps) => <GenericInput {...props} />,
  textarea: (props: InputProps) => <TextArea {...props} />,
  radio: (props: InputProps | RadioProps) => (
    <Radio {...(props as InputProps & RadioProps)} />
  ),
} as const;

/**
 * enum to access Inputs obj, must matched keys of Inputs obj
 * until a better method is determined this must be maintained
 * (runtime error thrown if a valid InputTypes is used)
 */
export enum InputTypes {
  INPUT = "input",
  TEXTAREA = "textarea",
  CHECKBOX = "checkbox",
  RADIO = "radio",
}
type GenericInputWrapperProps = {
  inputType: InputTypes;
  label: string;
  attributes?: InputAttributeProps;
  radioInputs?: RadioProps;
};
export const Input: React.FC<GenericInputWrapperProps> = ({
  inputType,
  label,
  attributes,
  radioInputs,
}) => {
  const id = `${inputType}-${new Date().getTime()}-${uuidV4()}`;
  if (inputType === InputTypes.RADIO) {
    radioInputs?.radios.forEach((radio) => {
      if (!radio.attributes) {
        radio.attributes = {};
      }
      radio.attributes.type = "radio";
      radio.attributes.name = id;
      radio.attributes.required = radioInputs.required;
    });
  }
  return (
    <div className={styles.wrapper}>
      {Inputs[inputType]({
        id,
        label,
        attributes,
        radios: radioInputs?.radios,
      })}
    </div>
  );
};
