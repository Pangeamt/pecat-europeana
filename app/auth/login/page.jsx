"use client";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Input,
  Card,
  CardBody,
  Button,
  CardHeader,
  CardFooter,
} from "@nextui-org/react";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = handleSubmit(async (data) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  });

  return (
    <div className="h-[calc(100vh-15rem)] flex justify-center items-center">
      <form onSubmit={onSubmit} className="w-80">
        {error && (
          <div
            className="mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="ml-2 block sm:inline">{error}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-center">
              <p className="text-md">Login Form</p>
            </div>
          </CardHeader>
          <CardBody>
            <Input
              {...register("email")}
              type="email"
              label="Email"
              variant="bordered"
              placeholder="user@email.com"
              className="mb-2"
              isInvalid={errors.email ? true : false}
              errorMessage={errors?.email?.message}
            />

            <Input
              label="Password"
              variant="bordered"
              placeholder="Enter your password"
              {...register("password")}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              className="max-w-xs"
              isInvalid={errors.password ? true : false}
              errorMessage={errors?.password?.message}
            />
            <CardFooter>
              <Button
                type="submit"
                color="primary"
                className="w-full bg-blue-500 text-white p-3 rounded-lg mt-2"
              >
                Login
              </Button>
            </CardFooter>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}

export default LoginPage;
