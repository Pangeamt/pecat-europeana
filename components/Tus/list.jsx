"use client";

import React, { useCallback, useEffect, useState } from "react";

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
  Pagination,
  Textarea,
  Chip,
  Progress,
  Spinner,
} from "@nextui-org/react";

import { capitalize } from "@/lib/utils";
import {
  SearchIcon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
} from "@/components/icons";
import { uid } from "uid";

const INITIAL_VISIBLE_COLUMNS = [
  "srcLiteral",
  "translatedLiteral",
  "reviewLiteral",
  "translationScorePercent",
  "actions",
];

const columns = [
  { name: "ID", uid: "id", sortable: true },
  {
    name: "TRANSLATION LITERAL ID",
    uid: "translationLiteralId",
    sortable: true,
  },
  { name: "TRANSLATION ID", uid: "translationId", sortable: true },
  { name: "COUNT", uid: "count", sortable: true },
  { name: "FIELD NAME", uid: "fieldName", sortable: true },
  { name: "SHORT FIELD NAME", uid: "shortFieldname", sortable: true },

  {
    name: "SRC LITERAL",
    uid: "srcLiteral",
    sortable: true,
  },
  {
    name: "TRANSLATED LITERAL",
    uid: "translatedLiteral",
    sortable: true,
  },
  {
    name: "REVIEW LITERAL",
    uid: "reviewLiteral",
    sortable: true,
  },
  { name: "SOURCE LANGUAGE", uid: "sourceLanguage", sortable: true },
  { name: "TARGET LANGUAGE", uid: "targetLanguage", sortable: true },
  { name: "TRANSLATION SCORE", uid: "translationScorePercent", sortable: true },
  { name: "STATUS", uid: "Status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "EDITED", uid: "EDITED" },
  { name: "ORIGINAL_ACCEPTED", uid: "ORIGINAL_ACCEPTED" },
  { name: "NOT_REVIEWED", uid: "NOT_REVIEWED" },
  { name: "REJECTED", uid: "REJECTED" },
];

const getWidthByColumn = (uid) => {
  switch (uid) {
    case "reviewLiteral":
      return 500;
    default:
      return null;
  }
};

const getClassByStatus = (status) => {
  switch (status) {
    case "REJECTED":
      return "bg-danger-100";
    case "ORIGINAL_ACCEPTED":
      return "bg-success-100";
    case "EDITED":
      return "bg-warning-100";
    default:
      return "";
  }
};

const dummyKeyboardDelegate = Object.fromEntries(
  [
    "getKeyBelow",
    "getKeyAbove",
    "getKeyLeftOf",
    "getKeyRightOf",
    "getKeyPageBelow",
    "getKeyPageAbove",
    "getFirstKey",
    "getLastKey",
    // HAVE TO ignore this one
    // "getKeyForSearch",
  ].map((name) => [name, () => null])
);

const ProjectList = ({ fileId }) => {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [tus, setTus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [selectedKey, setSelectedKey] = React.useState(null);
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [historyTus, setHistoryTus] = React.useState({});
  const [ra, setRa] = React.useState(uid());

  const [stats, setStats] = React.useState({
    notReviewed: 0,
    rejected: 0,
    originalAccepted: 0,
    edited: 0,
  });

  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "createdAt",
    direction: "descending",
  });

  const fetchTus = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/tus?fileId=${fileId}`);
    const data = await res.json();
    setTus(data.tus);
    const aux = {
      notReviewed: 0,
      rejected: 0,
      originalAccepted: 0,
      edited: 0,
    };
    for (const tu of data.tus) {
      if (tu.Status === "NOT_REVIEWED") {
        aux.notReviewed++;
      }
      if (tu.Status === "REJECTED") {
        aux.rejected++;
      }
      if (tu.Status === "ORIGINAL_ACCEPTED") {
        aux.originalAccepted++;
      }
      if (tu.Status === "EDITED") {
        aux.edited++;
      }
    }
    setStats(aux);
    setIsLoading(false);
    setRa(uid());
  }, [fileId]);

  // save tu
  const saveTu = useCallback(
    async (tuId, action) => {
      setIsLoading(true);
      await fetch(`/api/tus`, {
        method: "POST",
        body: JSON.stringify({ tuId, reviewLiteral: historyTus[tuId], action }),
      });
      fetchTus();
      setIsLoading(false);
    },
    [fetchTus, historyTus]
  );

  useEffect(() => {
    fetchTus();
  }, [fetchTus]);

  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredTus = [...tus];

    if (hasSearchFilter) {
      filteredTus = filteredTus.filter(
        (tu) =>
          tu.srcLiteral.toLowerCase().includes(filterValue.toLowerCase()) ||
          tu.translatedLiteral.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredTus = filteredTus.filter((tu) =>
        Array.from(statusFilter).includes(tu.Status)
      );
    }

    return filteredTus;
  }, [tus, hasSearchFilter, statusFilter, filterValue]);

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

  const renderCell = React.useCallback(
    (user, columnKey) => {
      const cellValue = user[columnKey];
      let text;

      switch (columnKey) {
        case "reviewLiteral":
          text = user["translatedLiteral"];
          if (user["reviewLiteral"] !== null) text = user["reviewLiteral"];
          return (
            <div
              css={{
                width: "100%", // Ajusta el ancho según tu caso
                height: "100%", // Ajusta la altura según tu caso
              }}
            >
              <Textarea
                className={` review-literal review-literal-${user.id}`}
                defaultValue={text}
                minRows={1}
                onFocus={() => {
                  if (selectedKey !== user.id) {
                    setSelectedKey(user.id);
                    fetchTus();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  const aux = historyTus;
                  aux[user.id] = value;
                  setHistoryTus(() => aux);
                }}
              />
            </div>
          );

        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Button
                isIconOnly
                aria-label="Like"
                color="success"
                size="sm"
                radius="full"
                onClick={() => {
                  saveTu(user.id, "approve");
                }}
                onPress={() => {
                  saveTu(user.id, "approve");
                }}
              >
                <CheckIcon />
              </Button>
              <Button
                isIconOnly
                aria-label="Like"
                color="danger"
                size="sm"
                radius="full"
                onClick={() => {
                  saveTu(user.id, "reject");
                }}
                onPress={() => {
                  saveTu(user.id, "reject");
                }}
              >
                <XIcon />
              </Button>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [fetchTus, historyTus, saveTu, selectedKey]
  );

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
            placeholder="Search..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <div key={ra} class="grid grid-rows-2">
              <div>
                <Chip className="mr-1" color="default" size="sm">
                  Not reviewed
                  <code className="text-xs ml-2">{stats.notReviewed}</code>
                </Chip>
                <Chip className="mr-1" color="primary" size="sm">
                  Edited
                  <code className="text-xs ml-2">{stats.edited}</code>
                </Chip>
                <Chip className="mr-1" color="success" size="sm">
                  Original accepted
                  <code className="text-xs ml-2">{stats.originalAccepted}</code>
                </Chip>
                <Chip className="mr-1" color="danger" size="sm">
                  Rejected
                  <code className="text-xs ml-2">{stats.rejected}</code>
                </Chip>
              </div>
              <div>
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
                  value={
                    isLoading || tus.length === 0
                      ? 0
                      : ((tus.length - stats.notReviewed) * 100) / tus.length
                  }
                  showValueLabel={true}
                />
              </div>
            </div>
            <div class="flex justify-start"></div>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
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
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {tus.length} tus
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              // defaultValue={rowsPerPage}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    ra,
    stats.notReviewed,
    stats.edited,
    stats.originalAccepted,
    stats.rejected,
    isLoading,
    tus.length,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
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
          <Button isDisabled={pages === 1} size="sm" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" onPress={onNextPage}>
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
      <Table
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "tu-table-wrapper",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
        keyboardDelegate={dummyKeyboardDelegate}
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
          emptyContent={!isLoading ? "No tus found" : " "}
          items={sortedItems}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.id} className={getClassByStatus(item.Status)}>
              {(columnKey) => (
                <TableCell onKeyDown={(e) => e.stopPropagation()}>
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default ProjectList;
