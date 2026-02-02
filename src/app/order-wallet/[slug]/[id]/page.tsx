"use client";
import Image from "next/image";
import { usePurchase } from "@/app/components/context/pre_order";
import DialogBox from "@/app/components/shared/dialog";
import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { formValueTypes } from "@/app/components/types/pre_order";
import axiosInstance from "../../../../../lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Page(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { purchaseItems = [], setPurchaseItems } = usePurchase();
  const [paymentsuccess, setpaymentSuccess] = useState<boolean>(false);
  const [itemValues, setItemvalues] = useState<{
    walletName: string;
    price: number | null;
    amount: number | null;
  }>({
    walletName: "",
    price: null,
    amount: null,
  });

  const router = useRouter();
  const hasRestored = useRef(false);

  useEffect(() => {
    if (hasRestored.current) return;

    const key = `orderitem-${params.slug}`;
    const saved = localStorage.getItem(key);

    if (!saved) {
      router.push(`/order-wallet/${params.slug}`);
      return;
    }

    const parsed = JSON.parse(saved);

    // Restore UI values
    setItemvalues({
      walletName: parsed.product_name,
      price: parsed.price,
      amount: parsed.amount,
    });

    // Restore purchaseItems if missing
    if (purchaseItems.length === 0) {
      const restored = [
        {
          id: parsed.id,
          slug: params.slug,
          product_name: parsed.product_name,
          amount: parsed.amount,
          price: parsed.price,
          complete: false,
          image: parsed.image,
          anonymous: false, // key for anonymous buy
        },
      ];
      setPurchaseItems(restored);
    }

    hasRestored.current = true;
  }, [params.slug, router, setPurchaseItems, purchaseItems.length]);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<formValueTypes>({
    firstName: "",
    lastName: "",
    location: "",
    state: "",
    email: "",
    tel: "",
    region: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (name === "tel" && value.length > 20) {
      parsedValue = value.slice(0, 20);
    }
    setFormValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const validateInputs = () => {
    let hasError = false;

    if (formValues.firstName === "") {
      hasError = true;
    }

    if (formValues.lastName === "") {
      hasError = true;
    }

    if (formValues.location === "") {
      hasError = true;
    }

    if (formValues.state === "") {
      hasError = true;
    }

    if (formValues.region === "") {
      hasError = true;
    }

    if (
      formValues.email === "" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
      hasError = true;
    }

    if (formValues.tel && !/^[\d+\s]*$/.test(formValues.tel.toString())) {
      hasError = true;
    }

    setError(hasError);

    return !hasError;
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      setError(false);
      getItemDetails();
      setOpenModal(!openModal);
    } else {
      validateInputs();
      setError(true);
      setOpenModal(!openModal);
    }
  };

  const updateOrder = () => {
    const updatedItems = purchaseItems.map((item) => {
      if (!item.complete) {
        return {
          ...item,
          complete: true,
        };
      }
      return item;
    });
    setPurchaseItems(updatedItems);
  };

  const getItemDetails = () => {
    if (purchaseItems.length === 0) return;
    const orderDetails = purchaseItems.map((item) => item);

    setItemvalues((prev) => ({
      ...prev,
      walletName: orderDetails[0].product_name,
      amount: orderDetails[0].amount,
      price: orderDetails[0].price,
    }));
  };

  const closeModal = () => {
    setOpenModal(!openModal);
    if (paymentsuccess && !error && !isPending && !isError) router.push(`/`);
  };

  const getStatusImage = () => {
    const completed = purchaseItems.some((item) => item.complete);
    return completed && !isError ? "/radioFilled.svg" : "/radioEmpty.svg";
  };

  const walletOrderRequest = async () => {
    try {
      const response = await axiosInstance.post("/api/ordered-wallets", {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        street: formValues.location,
        state: formValues.region,
        city: formValues.state,
        phoneNumber: formValues.tel,
        email: formValues.email,
        walletTypeId: purchaseItems[0].id,
        price: itemValues.price,
        quantity: itemValues.amount,
        isPickup: false,
      });
      return response;
    } catch (err) {
      console.error("Unable to process request:", err);
      throw err;
    }
  };

  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: walletOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setTimeout(() => {
        setPurchaseItems([]);
      }, 5000);
    },
  });

  // handles api request
  const handlePaidState = () => {
    setpaymentSuccess(true);
    setError(false);

    mutate();

    updateOrder();
  };

  const clearStateValues = () => {
    if (isError) {
      setpaymentSuccess(false);
      setError(false);
    }
  };

  return (
    <>
      <DialogBox
        header={
          error ? "ALERT!" : !error && !paymentsuccess ? "Make Payment!" : ""
        }
        open={openModal}
        message={
          paymentsuccess && !error && !isPending && !isError
            ? "You're all done! check your mail for order details and delivery date"
            : error
              ? "One or more input(s) invalid"
              : isError && paymentsuccess
                ? "Couldn't send your data, please contact support :("
                : ""
        }
        dismiss={closeModal}
        errorState={error}
        paymentState={paymentsuccess}
        clearState={clearStateValues}
      >
        {!isPending && !error && !paymentsuccess && (
          <>
            <div className="flex flex-col font-Satoshi font-bold justify-center items-center gap-y-2 my-4">
              <h1 className="text-[#AAAAAA] text-[16px]">You are to pay:</h1>
              <p className="text-white text-[28px]">
                NGN{" "}
                {itemValues.price?.toLocaleString("en", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="flex justify-between my-2">
              <div className="flex flex-col gap-y-2">
                <span className="text-[#AAAAAA] text-[16px]">Bank Name</span>
                <span className="text-white text-[20px]">Kuda Bank</span>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-[#AAAAAA] text-[16px]">
                  Account Number
                </span>
                <span className="text-white text-[20px]">3002979312</span>
              </div>
            </div>

            <div className="!border !border-[#2B2B2B] !rounded-md font-Satoshi !bg-[#1F1F1F] flex flex-col gap-y-2 px-3 py-2 my-2">
              <span className="text-[#AAAAAA] text-[14px]">
                When making your bank transfer, kindly use this as narration:
              </span>
              <span className="text-white">{formValues.firstName}</span>
            </div>
          </>
          // <div className="flex flex-col py-4 gap-y-4">
          //   <div className="flex md:flex-row flex-col md:items-center gap-y-2 gap-x-2">
          //     <h1 className="font-bold text-2xl">Account Name:</h1>
          //     <h1 className="text-xl">Stealthtech Solutions Limited </h1>
          //   </div>

          //   <div className="flex md:flex-row flex-col md:items-center gap-y-2 gap-x-4">
          //     <h1 className="font-bold text-2xl">Account Number:</h1>
          //     <h1 className="text-xl">3002979312</h1>
          //   </div>

          //   <div className="flex md:flex-row flex-col md:items-center gap-y-2 gap-x-2">
          //     <h1 className="font-bold text-2xl">Bank Name:</h1>
          //     <h1 className="text-xl">Kuda Bank</h1>
          //   </div>

          //   <div className="flex md:flex-row flex-col md:items-center gap-y-2 gap-x-2">
          //     <h1 className="font-bold text-2xl">Price:</h1>
          //     <h1 className="text-xl">
          //       NGN{" "}
          //       {itemValues.price?.toLocaleString("en", {
          //         maximumFractionDigits: 2,
          //       })}
          //     </h1>
          //   </div>
          //   <small className="!text-[#F7931A] text-xl">
          //     Use{" "}
          //     <span className="!text-white !font-bold">
          //       {formValues.firstName}
          //     </span>{" "}
          //     as narration
          //   </small>
          // </div>
        )}

        {isPending && <div className="text-2xl font-bold">Loading...</div>}

        <div className="flex items-center justify-center font-bold">
          <h1 className="text-2xl">
            {!error && paymentsuccess && !isPending && !isError
              ? "Congratulations! 🎉"
              : error
                ? "Check input fields"
                : isError && paymentsuccess
                  ? "Request failed 😓"
                  : ""}
          </h1>
        </div>

        {!paymentsuccess && !error && (
          <button
            onClick={handlePaidState}
            className="font-Satoshi !bg-[#F7931A] !cursor-pointer !text-[#ffffff] !py-4 !px-2 !w-full !text-center !rounded-md"
          >
            I have Already Paid
          </button>
        )}
      </DialogBox>

      <section className="text-white-100 w-full md:px-12 px-6 py-2 my-6 overflow-x-hidden">
        <section className="py-4 px-2">
          <div className="border-b border-b-black-500 flex gap-x-4 items-center md:flex-nowrap flex-wrap">
            <div className="w-2/4">
              <h1 className="lg:text-4xl md:text-2xl">Complete Your order</h1>
            </div>
            <div className="w-full flex gap-x-4 items-center justify-evenly py-8">
              <span className="w-1/3 flex items-center justify-center">
                <Image
                  src={"/radioFilled.svg"}
                  alt="status"
                  width={40}
                  height={40}
                />
                <p>Information</p>
              </span>
              <div className=" border-b border-b-black-500 w-1/3"></div>
              <span className="w-1/3 flex items-center justify-center">
                <Image
                  src={getStatusImage()}
                  alt="status"
                  width={40}
                  height={40}
                />
                <p>Finish</p>
              </span>
            </div>
          </div>
        </section>

        <section className="flex gap-x-8 lg:flex-row flex-col lg:h-[650px] md:h-auto overflow-y-hidden">
          <div className="lg:w-2/4 w-full">
            <h1 className="text-2xl">Billing & Shipping</h1>

            <form action="" className="w-full">
              <div className="w-full flex md:flex-row flex-col">
                <div className="md:w-2/4 flex flex-col md:mr-2 my-4">
                  <label htmlFor="firstname">
                    First Name<span className="text-red-700">*</span>
                  </label>
                  <input
                    className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                    type="text"
                    name="firstName"
                    id="firstname"
                    value={formValues.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:w-2/4 flex flex-col md:ml-2 my-4">
                  <label htmlFor="lastname">
                    Last Name<span className="text-red-700">*</span>
                  </label>
                  <input
                    className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                    type="text"
                    name="lastName"
                    id="lastname"
                    value={formValues.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="w-full flex flex-col">
                <label htmlFor="address">
                  House number and street name
                  <span className="text-red-700">*</span>
                </label>
                <input
                  className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                  type="text"
                  name="location"
                  id="address"
                  value={formValues.location}
                  onChange={handleChange}
                />
              </div>

              <div className="w-full flex md:flex-row flex-col">
                <div className="md:w-2/4 flex flex-col md:mr-2 my-4">
                  <label htmlFor="city">
                    Town/City<span className="text-red-700">*</span>
                  </label>
                  <input
                    className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                    type="text"
                    name="state"
                    id="city"
                    value={formValues.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:w-2/4 flex flex-col md:ml-2 my-4">
                  <label htmlFor="state">
                    State<span className="text-red-700">*</span>
                  </label>
                  <input
                    className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                    type="text"
                    name="region"
                    id="state"
                    value={formValues.region}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="w-full flex flex-col my-4">
                <label htmlFor="phone">
                  Phone Number
                  <span className="text-red-700">*</span>
                </label>
                <input
                  className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                  type="tel"
                  name="tel"
                  id="phone"
                  value={formValues.tel}
                  onChange={handleChange}
                />
              </div>

              <div className="w-full flex flex-col my-4">
                <label htmlFor="mail">
                  Email Address
                  <span className="text-red-700">*</span>
                </label>
                <input
                  className="bg-[#111111] p-4 rounded-md border border-black-500 focus:border-[#F7931A] focus:outline-hidden"
                  type="email"
                  name="email"
                  id="mail"
                  value={formValues.email}
                  onChange={handleChange}
                />
              </div>
            </form>
          </div>

          <div className="lg:w-2/4 w-full lg:mt-0 mt-12">
            <h1 className="text-2xl">Your order</h1>

            <div className="w-full my-12">
              <div className="w-full flex justify-between border-b border-b-black-500 border-dashed my-4 px-6">
                <h1 className=" text-lg mx-4">Product</h1>
                <h1 className="text-lg mx-4">Subtotal</h1>
              </div>
            </div>

            {purchaseItems.length > 0 ? (
              <div>
                {purchaseItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between md:px-6 px-3 text-[#D4D4D4]"
                  >
                    <div className="md:mx-4 flex justify-between items-center">
                      <div className="w-[50px] h-[50px] rounded-md flex justify-center items-center bg-[#161616]">
                        <Image
                          src={item.image}
                          alt={item.product_name}
                          width={20}
                          height={40}
                        />
                      </div>
                      <div className="mx-4">
                        <h1 className="text-lg">{item.product_name}</h1>
                        <small>The Original hardware wallet</small>
                      </div>
                      <span className="mx-4 md:text-2xl">x{item.amount}</span>

                      <p className="md:text-2xl">
                        <span className="mx-2">NGN</span>
                        {item.price.toLocaleString("en", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex justify-between items-center px-6 py-6 my-4 border-dashed border-b border-b-black-500">
                      <h1 className="md:text-2xl text-lg text-white-100">
                        Subtotal
                      </h1>
                      <p className="md:text-2xl">
                        <span className="mx-2">NGN</span>
                        {item.price.toLocaleString("en", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex justify-between items-center px-6 py-6 my-4 border-dashed border-b border-b-black-500">
                      <h1 className="md:text-2xl text-lg text-white-100">
                        Total
                      </h1>
                      <p className="md:text-2xl text-[#F7931A]">
                        <span className="mx-2">NGN</span>
                        {item.price.toLocaleString("en", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="w-full">
                      <button
                        onClick={handleSubmit}
                        className="!bg-[#F7931A] !text-center !cursor-pointer !px-4 !py-6 !text-white-100 !rounded-md !w-full !my-8"
                      >
                        Place Order NGN{" "}
                        {item.price.toLocaleString("en", {
                          maximumFractionDigits: 2,
                        })}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-2/4 lg:mt-0 mt-12 flex items-center justify-center text-[#F7931A]">
                <p className="text-2xl text-center">No order Details Found</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </>
  );
}
