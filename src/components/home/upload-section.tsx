"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import Image from "next/image";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { toast } from "sonner";

export const UploadFile = () => {
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(undefined);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("No File Selected");
      setSuccess(undefined);
      return;
    }
    setError(undefined);
    setSuccess("Analysing...");
    toast.success("Analysing...");

    setTimeout(() => {
      setSuccess(undefined);
    }, 5000);
  };

  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-4 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center lg:m-20">
        <div className="flex flex-col items-center lg:items-start">
          <Form>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-[#FF685B] text-center lg:text-left">
              Upload Your Prescription
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-md w-full p-16 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-gray-400 transition-all">
              <label htmlFor="picture" className="text-center">
                Drag and drop your picture here or click to upload
              </label>
              <Input type="file" id="picture" className="hidden" />
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            <Button
              type="button"
              onClick={handleSubmit}
              className="mt-4 bg-[#FF685B] text-white px-4 py-2 rounded-md mb-2"
            >
              Upload
            </Button>
            <FormError message={error} />
            <FormSuccess message={success} />
          </Form>
        </div>
        <div className="text-center lg:text-left lg:pl-10">
          <Image
            src="/health-report.png"
            alt="health-report"
            width={400}
            height={400}
            className="rotate-12"
          />
        </div>
      </div>
    </section>
  );
};
