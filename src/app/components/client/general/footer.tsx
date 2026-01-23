import { baseUrl } from "@/config";
import Image from "next/image";
import Link from "next/link";
import * as Icons from "@radix-ui/react-icons";

export type WaitlistFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
};

const getCurrentDateYear = () => {
  const today = new Date();
  return today.getFullYear();
};

const joinWaitlist = async (formData: WaitlistFormData) => {
  "use server";
  const url = baseUrl + "/waitlists";
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  };
  const response = await fetch(url, config);
  if (response.status !== 201) {
    const error = await response.json();
    if (error?.message?.toLowerCase() === "error.alreadyexist") {
      return { error: "You are already on the waitlist." };
    }
    return {
      error: "Something went wrong. Please try again later.",
    };
  }
  const data = await response.json();
  return { success: data };
};

const Footer = () => {
  return (
    <footer
      className="absolute bottom-0 translate-y-[110%] px-4 md:px-0 pb-20 w-full bg-[#010101] text-white-100"
      id="waitlist"
    >
      <section className="flex flex-col justify-center items-center mt-10 w-full px-6">
        <div className="w-full flex md:flex-row flex-col md:gap-y-0 gap-y-6 md:px-4 md:items-start py-12 font-Nunito">
          <div className="lg:w-1/4 md:w-2/4 w-full gap-x-4 flex flex-col gap-y-4 justify-center items-center">
            <div className="flex justify-center items-center w-fulsl">
              <Image
                src={"/stealth-logo.svg"}
                width={100}
                height={100}
                alt="logo"
              />
            </div>
            <div className="lg:w-3/4 md:w-full max-sm:w-2/4 flex justify-between items-center flex-wrap gap-y-2">
              <Link
                href="https://x.com/stealthmoney_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#4a4a4a] transition-colors duration-300"
                aria-label="Twitter"
              >
                <Image src={"/x.svg"} width={20} height={20} alt="" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/stealthmoney"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#4a4a4a] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Icons.LinkedInLogoIcon className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="https://www.instagram.com/stealthmoney_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#4a4a4a] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Icons.InstagramLogoIcon className="w-5 h-5 text-white" />
              </Link>

              <Link
                href="https://facebook.com/stealthmoney"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#4a4a4a] transition-colors duration-300"
                aria-label="facebook"
              >
                <Image
                  src={"/facebook.svg"}
                  width={20}
                  height={20}
                  alt="facebook"
                />
              </Link>
            </div>
          </div>

          <div className="lg:w-1/4 md:w-2/4 w-full gap-x-4 flex flex-col gap-y-4">
            <h1 className="font-bold">QUICK LINK</h1>
            <div className="flex flex-col md:gap-y-4 gap-y-6 text-white-300">
              <Link href="#faq" className="text-sm">
                FAQs
              </Link>
              <Link
                href="https://calendar.app.google/7gHUwCk2WNNLkX3AA"
                target="_blank"
                className="text-sm"
              >
                Setup your wallet
              </Link>
              <Link
                href="https://education.stealth.money"
                target="_blank"
                className="text-sm"
              >
                Bitcoin Education
              </Link>
              <Link href="/order-wallet" className="text-sm">
                Buy your wallets
              </Link>
            </div>
          </div>

          <div className="lg:w-1/4 md:w-2/4 w-full gap-x-4 flex flex-col gap-y-4">
            <div className="w-full gap-x-4 flex flex-col gap-y-4">
              <h1 className="font-bold">LEGAL</h1>
              <div className="flex flex-col md:gap-y-4 gap-y-6 text-white-300">
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  className="text-sm"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-sm"
                >
                  Privacy Policy
                </Link>
                <Link href="/aml-policy" target="_blank" className="text-sm">
                  AML Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:w-1/4 md:w-2/4 w-full gap-x-4 flex flex-col gap-y-4">
            <div className="w-full gap-x-4 flex flex-col gap-y-4">
              <h1 className="font-bold">PRODUCTS</h1>
              <div className="flex flex-col md:gap-y-4 gap-y-6 text-white-300">
                <Link href="/vip" target="_blank" className="text-sm">
                  Stealth VIP
                </Link>
                <Link
                  href="https://stealthtreasury.com"
                  target="_blank"
                  className="text-sm"
                >
                  Stealth Treasury
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:w-1/4 md:w-2/4 w-full gap-x-4 flex flex-col gap-y-4">
            <div className="w-full gap-x-4 flex flex-col gap-y-4">
              <h1 className="font-bold">CONTACT US</h1>
              <div className="flex flex-col md:gap-y-4 gap-y-6 text-white-300">
                <a
                  href="mailto:hello@stealth.money"
                  className="text-sm hover:underline text-orange-100"
                >
                  hello@stealth.money
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-black-500 my-12"></div>

        <div className="text-white-300 flex flex-col max-w-[800px] font-Nunito">
          <small className="font-bold text-[12px] mb-1">
            Copyright {getCurrentDateYear()}, All Rights Reserved by Stealth
            Money.
          </small>

          <small className="text-[12px] leading-5">
            Stealth Money does not provide investment, legal, or tax advice.
            Information about digital assets like Bitcoin serve as a general
            explanation of the services provided. Users on our platform need to
            verify their identity & complete KYC before they can use our
            service. Stealth Money is currently in beta.
          </small>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
