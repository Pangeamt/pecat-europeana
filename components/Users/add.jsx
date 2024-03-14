import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { MailIcon, LockIcon } from "@/components/icons";

const schema = yup
  .object()
  .shape({
    name: yup.string().required("Name is a required field"),
    email: yup.string().email().required("Email is a required field"),
    password: yup.string().required("Password is a required field"),
    rePassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Re-Password is a required field"),
  })
  .required();

const AddUser = ({ isOpen, onOpenChange, refetch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const res = await createUser(data);
    if (res.error) {
      setError(res.error);
    }

    onOpenChange(false);
    setLoading(false);
    refetch();
  });

  const createUser = async (value) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });
    const data = await res.json();
    return data;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <form onSubmit={onSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Add User
              </ModalHeader>
              <ModalBody>
                {error && (
                  <div
                    className="mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">Error!</strong>
                    <span className="ml-2 block sm:inline">{error}</span>
                  </div>
                )}
                <Input
                  autoFocus
                  label="Name"
                  placeholder="Enter your name"
                  variant="bordered"
                  isInvalid={errors.name ? true : false}
                  errorMessage={errors?.name?.message}
                  {...register("name")}
                />
                <Input
                  autoFocus
                  endContent={
                    <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Email"
                  placeholder="Enter your email"
                  variant="bordered"
                  type="email"
                  {...register("email")}
                  isInvalid={errors.email ? true : false}
                  errorMessage={errors?.email?.message}
                />
                <Input
                  endContent={
                    <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  variant="bordered"
                  name="password"
                  {...register("password")}
                  isInvalid={errors.password ? true : false}
                  errorMessage={errors?.password?.message}
                />
                <Input
                  endContent={
                    <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Re-Password"
                  placeholder="Enter your re-password"
                  type="password"
                  variant="bordered"
                  {...register("rePassword")}
                  isInvalid={errors.rePassword ? true : false}
                  errorMessage={errors?.rePassword?.message}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" type="submit" isLoading={loading}>
                  Add
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddUser;
