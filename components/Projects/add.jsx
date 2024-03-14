import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";

// Import React FilePond
import { FilePond } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

const ProjectAdd = ({ isOpen, onOpenChange }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Upload Files
            </ModalHeader>
            <ModalBody>
              <FilePond
                allowMultiple={true}
                maxFiles={3}
                server="/api/files"
                name="files"
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>  <strong class="text-red-500">(max 3)</strong>'
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProjectAdd;
