import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  RadioGroup,
  Radio,
  Input,
  Button,
} from "@nextui-org/react";

import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";

const ProjectAdd = ({ isOpen, onOpenChange }) => {
  const [selectWay, setSelectWay] = useState("upload-files");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/files", {
        method: "PUT",
        body: JSON.stringify({ url }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setUrl("");
        onOpenChange();
        setIsLoading(false);
      }
    } catch (error) {
      onOpenChange();
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Import Data
            </ModalHeader>
            <ModalBody>
              <RadioGroup
                label="Select the way to import the data"
                defaultValue={selectWay}
                onValueChange={setSelectWay}
              >
                <Radio value="upload-files">Upload files</Radio>
                <Radio value="url">Url</Radio>
              </RadioGroup>
              {selectWay === "upload-files" && (
                <FilePond
                  allowMultiple={true}
                  maxFiles={3}
                  server="/api/files"
                  name="files"
                  labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>  <strong class="text-red-500">(max 3)</strong>'
                />
              )}
              {selectWay === "url" && (
                <>
                  <Input
                    type="url"
                    placeholder="http://example.com/data"
                    labelPlacement="outside"
                    defaultValue={url}
                    onInput={(e) => setUrl(e.target.value)}
                  />
                  <Button
                    onClick={onSubmit}
                    className="mb-5"
                    color="primary"
                    isLoading={isLoading}
                    loadingText="Sending"
                  >
                    Send
                  </Button>
                </>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProjectAdd;
