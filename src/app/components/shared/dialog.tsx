"use client";
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

interface DialogBoxTypes {
  open: boolean;
  dismiss: () => void;
  header: string;
  message: string;
  children?: React.ReactNode;
  errorState?: boolean;
  paymentState?: boolean;
  clearState: () => void;
}

const DialogBox = ({
  open,
  dismiss,
  header,
  message,
  children,
  errorState,
  paymentState,
  clearState,
}: DialogBoxTypes) => {
  const pathname = usePathname();
  return (
    <Dialog.Root open={open} onOpenChange={dismiss} modal={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black-500 opacity-40" />
        <Dialog.Content
          className={`flex items-between flex-col gap-2 text-white-100 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] ${
            pathname.includes("checkout")
              ? "md:max-w-[520px] max-w-[450px]"
              : "max-w-[450px]"
          } translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-[#161616] p-[25px] shadow-[hsl(206_22%_7%/35%)_0px_10px_38px_-10px,hsl(206_22%_7%/20%)_0px_10px_20px_-15px] focus:outline-hidden`}
        >
          <Dialog.Title className="m-0 text-lg font-bold text-[20px]">
            {header}
          </Dialog.Title>
          <Dialog.Description className="mt-[10px] mb-5 text-[15px] leading-normal text-[#D4D4D4]">
            {message}
          </Dialog.Description>
          {children}
          <div className="mt-[25px] flex justify-end">
            {(errorState || paymentState) && (
              <Dialog.Close asChild>
                <button
                  className="!bg-[#F7931A] inline-flex !h-[35px] items-center justify-center !rounded-[4px] !px-[15px] font-medium leading-none focus:outline-hidden"
                  onClick={clearState}
                >
                  close
                </button>
              </Dialog.Close>
            )}
          </div>
          <Dialog.Close asChild>
            <button
              className="!absolute !top-[10px] !right-[10px] !inline-flex !h-[25px] !w-[25px] !appearance-none !items-center !justify-center !rounded-full !focus:shadow-[0_0_0_2px] !focus:outline-hidden"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DialogBox;
