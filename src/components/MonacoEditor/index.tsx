import React from "react";
import styled from "styled-components";
import Editor, { loader, useMonaco } from "@monaco-editor/react";
import { Loading } from "src/layout/Loading";
import useFile from "src/store/useFile";
import useStored from "src/store/useStored";

loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs",
  },
});

const editorOptions = {
  formatOnPaste: true,
  formatOnType: true,
  minimap: {
    enabled: false,
  },
};

const StyledWrapper = styled.div`
  display: grid; // Added a semicolon here
  height: calc(100vh - 63px); // Added a semicolon here
  grid-template-columns: 100%; // Added a semicolon here
  grid-template-rows: minmax(0, 1fr); // Added a semicolon here
`;

export const MonacoEditor = () => {
  const monaco = useMonaco();
  const contents = useFile(state => state.contents);
  const setContents = useFile(state => state.setContents);
  const setError = useFile(state => state.setError);
  const jsonSchema = useFile(state => state.jsonSchema);
  const getHasChanges = useFile(state => state.getHasChanges);
  const theme = useStored(state => (state.lightmode ? "light" : "vs-dark"));
  const fileType = useFile(state => state.format);

  React.useEffect(() => {
    monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      enableSchemaRequest: true,
      schemas: jsonSchema
        ? [
            {
              uri: "http://example.com/schema.json", // Replace with your schema URI
              fileMatch: ["*"],
              schema: jsonSchema, // Parse the JSON schema if it's a string
            },
          ]
        : [],
    });
  }, [jsonSchema, monaco?.languages.json.jsonDefaults]);

  React.useEffect(() => {
    const beforeunload = (e: BeforeUnloadEvent) => {
      if (getHasChanges()) {
        const confirmationMessage =
          "Unsaved changes, if you leave before saving  your changes will be lost";

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", beforeunload);

    return () => {
      window.removeEventListener("beforeunload", beforeunload);
    };
  }, [getHasChanges]);

  return (
    <StyledWrapper>
      <Editor
        height="100%"
        language={fileType}
        theme={theme === "light" ? "vs-light" : "vs-dark"} // Adjust the theme property
        value={contents}
        options={editorOptions}
        onValidate={errors => setError(errors[0])}
        onChange={contents => setContents({ contents, skipUpdate: true })}
        loading={<Loading message="Loading Editor..." />}
      />
    </StyledWrapper>
  );
};
