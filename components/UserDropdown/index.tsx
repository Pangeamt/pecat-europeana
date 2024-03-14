"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
} from "@nextui-org/react";

import { signOut } from "next-auth/react";

function UserDropdown({ session }: { session: any }) {
  const image =
    session && session?.user?.image
      ? (session?.user?.image as string)
      : "/images/Logo perfil RRSS 1.png";
  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <User
          as="button"
          avatarProps={{
            isBordered: true,
            src: image as string,
          }}
          className="transition-transform"
          description={session?.user?.email}
          name={session?.user?.name}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-bold">Signed in as</p>
          <p className="font-bold">{session?.user?.email}</p>
        </DropdownItem>
        <DropdownItem key="settings">My Settings</DropdownItem>
        <DropdownItem key="logout" color="danger" onClick={() => signOut()}>
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>

    // <Dropdown>
    //   <DropdownTrigger>
    //     <Button
    //       className="text-sm font-normal text-default-600 bg-default-100"
    //       startContent={
    //         <Image
    //           src={
    //             session && session?.user?.image
    //               ? (session?.user?.image as string)
    //               : LogoPangeanic
    //           }
    //           alt=""
    //           width={30}
    //         />
    //       }
    //       variant="flat"
    //     >
    //       {session?.user?.name}
    //     </Button>
    //   </DropdownTrigger>
    //   <DropdownMenu
    //     aria-label="Example with disabled actions"
    //     disabledKeys={["edit", "delete"]}
    //   >
    //     <DropdownItem key="delete" className="text-danger" color="danger">
    //       <div className="flex justify-start">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           fill="none"
    //           viewBox="0 0 24 24"
    //           strokeWidth={1.5}
    //           stroke="currentColor"
    //           className="w-5 h-5 mr-1"
    //         >
    //           <path
    //             strokeLinecap="round"
    //             strokeLinejoin="round"
    //             d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    //           />
    //         </svg>
    //         Logout
    //       </div>
    //     </DropdownItem>
    //   </DropdownMenu>
    // </Dropdown>
  );
}
export default UserDropdown;
