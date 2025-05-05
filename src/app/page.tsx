"use client";
import { App, Button, Row, Tabs, Upload, UploadFile, message, Spin } from "antd";
import { useState } from "react";
import { FirstImageUpload, ImagePreview } from "./utils/imageUploadComponent";
import { UploadChangeParam } from "antd/es/upload";
import { CloudUploadOutlined, FileImageOutlined, CodeOutlined } from "@ant-design/icons";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");

  const items = [
    {
      key: "image",
      label: (
        <span className="flex items-center">
          <FileImageOutlined className="mr-2" />
          รูปภาพสลิป
        </span>
      ),
      children: <ImageUploadComponent />,
    },
    {
      key: "base64",
      label: (
        <span className="flex items-center">
          <CodeOutlined className="mr-2" />
          Base64
        </span>
      ),
      children: <Base64ImageUpload />,
    },
    {
      key: "payload",
      label: (
        <span className="flex items-center">
          <CloudUploadOutlined className="mr-2" />
          Payload
        </span>
      ),
      children: <PayloadUploadComponent />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-center text-gray-800">ระบบตรวจสอบสลิปการโอนเงิน</h1>
            <p className="text-center text-gray-500 mt-2">เลือกวิธีการอัปโหลดสลิปจากเมนูด้านล่าง</p>
          </div>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className="p-4" type="card" />
        </div>
      </div>
    </div>
  );
}

const ImageUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      message.error("กรุณาเลือกไฟล์ก่อน!");
      return;
    }

    setIsLoading(true);
    setResponseMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://developer.easyslip.com/api/v1/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_EASYSLIP_API_TOKEN}`,
        },
        body: formData,
      });

      const data = await response.json();
      setResponseMessage(JSON.stringify(data, null, 2));

      if (data.status !== 200) {
        message.error(`เกิดข้อผิดพลาด: ${data.message || "ไม่ทราบสาเหตุ"}`);
      } else {
        message.success("ยืนยันการอัปโหลดสำเร็จ!");
      }
    } catch (error: any) {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ API");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">อัปโหลดไฟล์สลิป</h2>
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            เลือกไฟล์สลิป
          </label>
          <input
            type="file"
            id="file"
            className="mt-1 block w-full text-sm text-gray-500 
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                    file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 
                    hover:file:bg-blue-100 transition-all duration-200"
            onChange={handleFileChange}
            accept="image/*"
          />
          {file && <div className="mt-2 text-sm text-gray-600">ไฟล์ที่เลือก: {file.name}</div>}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                   disabled:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spin size="small" className="mr-2" /> กำลังอัปโหลด...
            </>
          ) : (
            <>
              <CloudUploadOutlined className="mr-2" /> อัปโหลด
            </>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">ผลการตรวจสอบ</h2>
        {responseMessage ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-auto">
            <h3 className="text-sm font-bold mb-2">ข้อมูลจาก API:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{responseMessage}</pre>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">รอผลการตรวจสอบ</div>
        )}
      </div>
    </div>
  );
};

const Base64ImageUpload: React.FC<{}> = () => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [bookbank, setBookbank] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookbankChange = (info: UploadChangeParam<UploadFile>) => {
    const { file } = info;

    if (file.status === "done") {
      setBookbank((prevFileList) => {
        const newFile = {
          ...file,
          url: URL.createObjectURL(file.originFileObj as Blob),
        };

        if (prevFileList.length < 3) {
          return [...prevFileList, newFile];
        } else {
          return [...prevFileList.slice(0, 2), newFile];
        }
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setBookbank((prevFileList) => prevFileList.filter((_, i) => i !== index));
  };

  const verifyEasySlip = async () => {
    if (bookbank.length === 0) {
      message.error("กรุณาเลือกไฟล์สลิปก่อน!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", bookbank[0].originFileObj as Blob);

    try {
      const response = await fetch("https://developer.easyslip.com/api/v1/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_EASYSLIP_API_TOKEN || "3414f1cb-ef5c-4354-af6f-d459fb71dce8"}`,
        },
        body: formData,
      });

      const data = await response.json();
      setResponseMessage(JSON.stringify(data, null, 2));

      if (data.status === 200) {
        message.success("ตรวจสอบสลิปสำเร็จ!");
      } else {
        message.error(`เกิดข้อผิดพลาด: ${data.message || "ไม่ทราบสาเหตุ"}`);
      }

      return data;
    } catch (error) {
      console.error("Error calling EasySlip API:", error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ API");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">อัปโหลดรูปสลิป</h2>

        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 min-h-64 flex flex-col items-center justify-center">
          {bookbank.map((file, index) => (
            <ImagePreview key={file.uid} file={file} onRemove={() => handleRemoveImage(index)} isOriginalProductImage={!file.originFileObj} index={index} />
          ))}

          {bookbank.length === 0 && <FirstImageUpload onChange={handleBookbankChange} fileLimit={2} size={{ width: "100%", height: "240px" }} text="คลิกเพื่ออัพโหลดรูปสลิป" />}
        </div>

        <Button
          onClick={verifyEasySlip}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                   disabled:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
          disabled={bookbank.length === 0 || isLoading}
          type="primary"
          size="large"
          icon={isLoading ? <Spin size="small" /> : <CloudUploadOutlined />}
        >
          {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบสลิป"}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">ผลการตรวจสอบ</h2>
        {responseMessage ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-auto">
            <h3 className="text-sm font-bold mb-2">ข้อมูลจาก API:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{responseMessage}</pre>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">รอผลการตรวจสอบ</div>
        )}
      </div>
    </div>
  );
};

const PayloadUploadComponent = () => {
  const [payload, setPayload] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!payload) {
      message.error("กรุณากรอกข้อมูล Payload ก่อน!");
      return;
    }

    setIsLoading(true);
    setResponseMessage(null);

    try {
      // This is a placeholder for your actual payload API endpoint
      const response = await fetch("https://developer.easyslip.com/api/v1/verify-payload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_EASYSLIP_API_TOKEN || "3414f1cb-ef5c-4354-af6f-d459fb71dce8"}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      });

      const data = await response.json();
      setResponseMessage(JSON.stringify(data, null, 2));

      if (data.status !== 200) {
        message.error(`เกิดข้อผิดพลาด: ${data.message || "ไม่ทราบสาเหตุ"}`);
      } else {
        message.success("ตรวจสอบ Payload สำเร็จ!");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ API");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">ส่ง Payload</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payload JSON</label>
          <textarea value={payload} onChange={(e) => setPayload(e.target.value)} className="w-full min-h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder='{"key": "value"}' />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                   disabled:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spin size="small" className="mr-2" /> กำลังส่ง...
            </>
          ) : (
            <>
              <CloudUploadOutlined className="mr-2" /> ส่งข้อมูล
            </>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">ผลการตรวจสอบ</h2>
        {responseMessage ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-auto">
            <h3 className="text-sm font-bold mb-2">ข้อมูลจาก API:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{responseMessage}</pre>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">รอผลการตรวจสอบ</div>
        )}
      </div>
    </div>
  );
};
