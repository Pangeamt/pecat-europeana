import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Tooltip,
} from "@nextui-org/react";

import { EditIcon } from "@/components/icons";

type ProjectEditProps = {
  project: {
    filename: string;
    id: string;
    label: string;
    // Add other properties here if needed
  };
  action: (file: any) => void;
};

const ProjectEdit = ({ project, action }: ProjectEditProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [label, setLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLabel(project.label);
  }, [project.id, project.label]);

  //   save the project
  const saveProject = async () => {
    setIsSaving(true);
    await action({
      fileId: project.id,
      data: {
        label,
      },
    });
    onOpenChange();
    setIsSaving(false);
  };

  return (
    <>
      <Tooltip content="Edit label file">
        <span
          onClick={onOpen}
          className="text-lg text-default-400 cursor-pointer active:opacity-50"
        >
          <EditIcon color="#2870ef" />
        </span>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {project.filename}
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  //   endContent={
                  //     <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  //   }
                  label="Label"
                  placeholder="Enter your label"
                  variant="bordered"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  isLoading={isSaving}
                  color="primary"
                  onPress={saveProject}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectEdit;
