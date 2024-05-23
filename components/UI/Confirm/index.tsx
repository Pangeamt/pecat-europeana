import React, { ReactNode, useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

interface ConfirmProps {
  icon: ReactNode;
  text: string;
  title: string;
  action: () => void;
}

const Confirm = ({ text, action, icon, title }: ConfirmProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // deleting state
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmAction = async () => {
    setIsDeleting(true);
    await action();
    onOpenChange();
    setIsDeleting(false);
  };
  return (
    <>
      <div onClick={onOpen}>{icon}</div>
      <Modal
        className="confirm-delete-modal"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <p>{text}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  isLoading={isDeleting}
                  color="danger"
                  onPress={confirmAction}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Confirm;
