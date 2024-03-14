"use client";
import React from "react";
import axios from "axios";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  useDisclosure,
  Button,
} from "@nextui-org/react";

import { EditIcon, DeleteIcon, EyeIcon, PlusIcon } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";

import AddUser from "@/components/Users/add";

const columns = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "Email Verified", uid: "emailVerified" },
  { name: "ACTIONS", uid: "actions", align: "end" },
];

export default function App() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const {
    isLoading,
    data: users = [],
    refetch,
  } = useQuery({
    queryKey: ["repoData"],
    queryFn: () => {
      return axios
        .get("/api/users")
        .then((res) => res.data.users)
        .catch((error) => {
          throw new Error(error.response.data.message);
        });
    },
  });

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {user.team}
            </p>
          </div>
        );
      case "emailVerified":
        return (
          <Chip
            className="capitalize"
            color={user.emailVerified != null ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {user.emailVerified ? "true" : "false"}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <div className="flex gap-3">
          <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
            Add New
          </Button>
        </div>
      </div>
      <Table aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={users} isLoading={isLoading}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AddUser isOpen={isOpen} onOpenChange={onOpenChange} refetch={refetch} />
    </div>
  );
}
