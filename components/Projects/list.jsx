"use client";

import React, { useEffect, useState } from "react";
import * as dayjs from "dayjs";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  User,
  Pagination,
  useDisclosure,
  Tooltip,
  Progress,
  Spinner,
} from "@nextui-org/react";

import { capitalize } from "@/lib/utils";
import {
  SearchIcon,
  ChevronDownIcon,
  PlusIcon,
  EyeIcon,
  DeleteIcon,
  DownloadIcon,
} from "@/components/icons";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";

import ProjectAdd from "@/components/Projects/add";
import ProjectEdit from "@/components/Projects/edit";

import Confirm from "@/components/UI/Confirm";

const INITIAL_VISIBLE_COLUMNS = [
  "filename",
  "label",
  "User",
  "createdAt",
  "progress",
  "stats",
  "actions",
];

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "FILENAME", uid: "filename", sortable: true },
  { name: "LABEL", uid: "label", sortable: true },
  { name: "CREATED AT", uid: "createdAt", sortable: true },
  { name: "UPDATED AT", uid: "updatedAt", sortable: true },
  { name: "USER", uid: "User", sortable: true },
  { name: "", uid: "progress" },
  { name: "STATS", uid: "stats" },
  { name: "ACTIONS", uid: "actions" },
];

const getWidthByColumn = (uid) => {
  switch (uid) {
    case "stats":
      return 220;
    case "actions":
      return 100;
    default:
      return null;
  }
};

const ProjectList = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "createdAt",
    direction: "descending",
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects);
    setIsLoading(false);
  };

  const deleteFile = async (fileId) => {
    const res = await fetch(`/api/projects`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });
    const data = await res.json();
    if (data.status === "success") {
      await fetchProjects();
    }
  };

  const saveFile = async (file) => {
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(file),
    });
    const data = await res.json();
    if (data.status === "success") {
      await fetchProjects();
    }
  };

  const copyLink = (fileId) => {
    copy(`${baseURL}/api/projects?fileId=${fileId}`);
    toast("Link copied to clipboard!", {
      icon: "📋",
    });
  };

  useEffect(() => {
    if (!isOpen) {
      fetchProjects();
      setRowsPerPage(10);
    }
  }, [isOpen]);

  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredProjects = [...projects];

    if (hasSearchFilter) {
      filteredProjects = filteredProjects.filter((project) =>
        project.filename.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredProjects;
  }, [projects, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = (project, columnKey) => {
    const cellValue = project[columnKey];

    switch (columnKey) {
      case "createdAt":
        return <p>{dayjs(cellValue).format("DD/MM/YYYY")}</p>;
      case "User":
        return (
          <User
            avatarProps={{ radius: "lg", src: project.User.image, size: "sm" }}
            description={project.User.email}
          >
            {project.User.email}
          </User>
        );
      case "stats":
        return (
          <div className="">
            {project.countByStatus.map((status) => {
              return (
                <div key={status.Status} className="flex justify-between">
                  <span className="text-xs">{capitalize(status.Status)}</span>
                  <code>{status._count}</code>
                </div>
              );
            })}
            <div key="total" className="flex justify-between">
              <span className="text-xs">TOTAL</span>
              <code>{project.totalCount}</code>
            </div>
          </div>
        );
      case "progress":
        const NOT_REVIEWED = project.countByStatus.find((item) => {
          if (item.Status === "NOT_REVIEWED") {
            return true;
          }
        });
        const aux = NOT_REVIEWED ? NOT_REVIEWED._count : 0;
        const percentage = (
          ((project.totalCount - aux) * 100) /
          project.totalCount
        ).toFixed(2);

        return (
          <Progress
            size="sm"
            radius="sm"
            classNames={{
              base: "max-w-md",
              track: "drop-shadow-md border border-default",
              indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
              label: "tracking-wider font-medium text-default-600",
              value: "text-foreground/60",
            }}
            label="Progress"
            value={percentage}
            showValueLabel={true}
          />
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <Link href={`/dashboard/tus/${project.id}`}>
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EyeIcon />
                </span>
              </Link>
            </Tooltip>

            <Dropdown>
              <DropdownTrigger>
                <Tooltip content="Download">
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <DownloadIcon />
                  </span>
                </Tooltip>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem>
                  <p onClick={() => copyLink(project.id)} key="copy">
                    Copy link
                  </p>
                </DropdownItem>
                <DropdownItem key="download">
                  <Link
                    href={`/api/projects?fileId=${project.id}`}
                    target="_blank"
                  >
                    Download file
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <ProjectEdit project={project} action={saveFile} />

            <Confirm
              title="Delete Project"
              text="Are you sure you want to delete this item?"
              action={async () => deleteFile(project.id)}
              icon={
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon />
                </span>
              }
            />
          </div>
        );
      default:
        return cellValue;
    }
  };

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {projects.length} projects
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    visibleColumns,
    onOpen,
    projects.length,
    onRowsPerPageChange,
    rowsPerPage,
    onClear,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    filteredItems.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <>
      <Toaster />
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={
          {
            // wrapper: "max-h-[70vh]",
          }
        }
        selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        isStriped
        isCompact
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
              width={getWidthByColumn(column.uid)}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={!isLoading ? "No projects found" : " "}
          items={sortedItems}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ProjectAdd
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        refetch={fetchProjects}
      />
    </>
  );
};

export default ProjectList;
