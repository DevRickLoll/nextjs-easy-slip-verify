"use client";
import { App, Button, Row, Tabs, Upload, UploadFile, message, Spin, Typography, Card, Tag, Tooltip, Divider, Col } from "antd";
import { useState } from "react";
import { FirstImageUpload, ImagePreview } from "./utils/imageUploadComponent";
import { UploadChangeParam } from "antd/es/upload";
import { CloudUploadOutlined, FileImageOutlined, CodeOutlined, CheckCircleFilled, CopyOutlined, CalendarOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Image from "next/image";
const { Title, Text } = Typography;

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");

  const items = [
    {
      key: "image",
      label: (
        <span className="flex items-center">
          <FileImageOutlined className="mr-2" />
          <span className="hidden sm:inline">Image</span>
        </span>
      ),
      children: <ImageUploadComponent />,
    },
    {
      key: "base64",
      label: (
        <span className="flex items-center">
          <CodeOutlined className="mr-2" />
          <span className="hidden sm:inline">Base64</span>
        </span>
      ),
      children: <Base64ImageUpload />,
    },
    {
      key: "payload",
      label: (
        <span className="flex items-center">
          <CloudUploadOutlined className="mr-2" />
          <span className="hidden sm:inline">Payload</span>
        </span>
      ),
      children: <PayloadUploadComponent />,
    },
  ];

  return (
    <App>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-2 sm:p-4">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={150}
              height={150}
              className="mx-auto"
              style={{ objectFit: "contain" }}
              onError={() => {
                // Using Image from next/image doesn't support onError directly
                // Error handling will need to use a different approach
              }}
            />
            <Title level={2} className="text-center text-gray-800 text-xl sm:text-2xl md:text-3xl mb-0" style={{ marginBottom: "0 !important" }}>
              EASYSLIP
            </Title>

            <div className="p-3 sm:p-6 border-b border-gray-200">
              <Row justify="center">
                <Col>
                  <Title level={2} className="text-center text-gray-800 text-xl sm:text-2xl md:text-3xl">
                    ระบบตรวจสอบสลิปการโอนเงิน
                  </Title>
                  <Text className="block text-center text-gray-500 text-sm sm:text-base">เลือกวิธีการอัปโหลดสลิปจากเมนูด้านล่าง</Text>
                </Col>
              </Row>
            </div>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className="p-2 sm:p-4" type="card" size="middle" />
          </div>
        </div>
      </div>
    </App>
  );
}

const ImageUploadComponent = () => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [slip, setslip] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { message } = App.useApp();

  const handleslipChange = (info: UploadChangeParam<UploadFile>) => {
    const { file } = info;

    if (file.status === "done") {
      setslip((prevFileList) => {
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
    setslip((prevFileList) => prevFileList.filter((_, i) => i !== index));
    setResponseMessage(null);
  };

  const verifyEasySlip = async () => {
    if (slip.length === 0) {
      message.error("กรุณาเลือกไฟล์สลิปก่อน!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", slip[0].originFileObj as Blob);

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">อัปโหลดรูปสลิป</h2>

        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3 md:p-4 min-h-64 flex flex-col items-center justify-center">
          {slip.map((file, index) => (
            <ImagePreview key={file.uid} file={file} onRemove={() => handleRemoveImage(index)} isOriginalProductImage={!file.originFileObj} index={index} />
          ))}

          {slip.length === 0 && <FirstImageUpload onChange={handleslipChange} fileLimit={1} size={{ width: "100%", height: "240px" }} text="คลิกเพื่ออัพโหลดรูปสลิป" />}
        </div>

        <Button
          onClick={verifyEasySlip}
          className="mt-4 w-full bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-blue-700
                     disabled:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
          disabled={slip.length === 0 || isLoading}
          type="primary"
          size="large"
          icon={isLoading ? <Spin size="small" /> : <CloudUploadOutlined />}
        >
          {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบสลิป"}
        </Button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">ผลการตรวจสอบ</h2>
        <TransactionDetails transaction={JSON.parse(responseMessage || "{}") as TransactionData} />
        {responseMessage ? (
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 md:max-h-96 overflow-auto mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-bold">ข้อมูลจาก API:</h3>
              <Tooltip title={copied === "payload" ? "คัดลอกแล้ว!" : "คัดลอก"}>
                <CopyOutlined className={`flex-shrink-0 text-xs cursor-pointer ${copied === "payload" ? "text-green-500" : "text-gray-400"}`} onClick={() => copyToClipboard(responseMessage, "payload")} />
              </Tooltip>
            </div>
            {/* <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">{responseMessage}</pre> */}
            <div className="flex items-center justify-between mb-2">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all w-full">{responseMessage}</pre>
            </div>
          </div>
        ) : (
          <div className="h-48 md:h-64 flex items-center justify-center text-gray-400">รอผลการตรวจสอบ</div>
        )}
      </div>
    </div>
  );
};

const Base64ImageUpload: React.FC<{}> = () => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [slip, setslip] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { message } = App.useApp();

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleslipChange = (info: UploadChangeParam<UploadFile>) => {
    const { file } = info;

    if (file.status === "done") {
      setslip((prevFileList) => {
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
    setslip((prevFileList) => prevFileList.filter((_, i) => i !== index));
    setResponseMessage(null);
  };

  const verifyEasySlip = async () => {
    if (slip.length === 0) {
      message.error("กรุณาเลือกไฟล์สลิปก่อน!");
      return;
    }

    setIsLoading(true);

    const base64String = await getBase64(slip[0].originFileObj as File);

    try {
      const response = await fetch("https://developer.easyslip.com/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_EASYSLIP_API_TOKEN}`,
        },
        body: JSON.stringify({
          image: base64String,
        }),
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">อัปโหลดรูปสลิป</h2>

        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3 md:p-4 min-h-64 flex flex-col items-center justify-center">
          {slip.map((file, index) => (
            <ImagePreview key={file.uid} file={file} onRemove={() => handleRemoveImage(index)} isOriginalProductImage={!file.originFileObj} index={index} />
          ))}

          {slip.length === 0 && <FirstImageUpload onChange={handleslipChange} fileLimit={1} size={{ width: "100%", height: "240px" }} text="คลิกเพื่ออัพโหลดรูปสลิป" />}
        </div>

        <Button
          onClick={verifyEasySlip}
          className="mt-4 w-full bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-blue-700
                   disabled:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
          disabled={slip.length === 0 || isLoading}
          type="primary"
          size="large"
          icon={isLoading ? <Spin size="small" /> : <CloudUploadOutlined />}
        >
          {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบสลิป"}
        </Button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">ผลการตรวจสอบ</h2>
        <TransactionDetails transaction={JSON.parse(responseMessage || "{}") as TransactionData} />
        {responseMessage ? (
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 md:max-h-96 overflow-auto mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-bold">ข้อมูลจาก API:</h3>
              <Tooltip title={copied === "payload" ? "คัดลอกแล้ว!" : "คัดลอก"}>
                <CopyOutlined className={`flex-shrink-0 text-xs cursor-pointer ${copied === "payload" ? "text-green-500" : "text-gray-400"}`} onClick={() => copyToClipboard(responseMessage, "payload")} />
              </Tooltip>
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">{responseMessage}</pre>
          </div>
        ) : (
          <div className="h-48 md:h-64 flex items-center justify-center text-gray-400">รอผลการตรวจสอบ</div>
        )}
      </div>
    </div>
  );
};

const PayloadUploadComponent = () => {
  const [payload, setPayload] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { message } = App.useApp();

  const handleSubmit = async () => {
    if (!payload) {
      message.error("กรุณากรอกข้อมูล Payload ก่อน!");
      return;
    }

    setIsLoading(true);
    setResponseMessage(null);

    try {
      const encodedPayload = encodeURIComponent(payload);

      const response = await fetch(`https://developer.easyslip.com/api/v1/verify?payload=${encodedPayload}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_EASYSLIP_API_TOKEN}`,
        },
      });

      const data = await response.json();
      setResponseMessage(JSON.stringify(data, null, 2));

      if (data.status === 200) {
        message.success("ตรวจสอบ Payload สำเร็จ!");
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* ซ้าย: กรอก Payload + ปุ่ม */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">ส่ง Payload</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payload (QR Code)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full min-h-32 md:min-h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ใส่ payload ที่อ่านได้จาก QR Code"
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-blue-700
						disabled:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
          disabled={isLoading}
          type="primary"
          size="large"
          icon={isLoading ? <Spin size="small" /> : <CloudUploadOutlined />}
        >
          {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบ Payload"}
        </Button>
      </div>

      {/* ขวา: แสดง TransactionDetails + raw API response */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">ผลการตรวจสอบ</h2>

        {/* TransactionDetails (ถ้ามีข้อมูล) */}
        <TransactionDetails transaction={JSON.parse(responseMessage || "{}")} />

        {/* Raw API Response */}
        {responseMessage ? (
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 md:max-h-96 overflow-auto mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-bold">ข้อมูลจาก API:</h3>
              <Tooltip title={copied === "payload" ? "คัดลอกแล้ว!" : "คัดลอก"}>
                <CopyOutlined className={`flex-shrink-0 text-xs cursor-pointer ${copied === "payload" ? "text-green-500" : "text-gray-400"}`} onClick={() => copyToClipboard(responseMessage, "payload")} />
              </Tooltip>
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">{responseMessage}</pre>
          </div>
        ) : (
          <div className="h-48 md:h-64 flex items-center justify-center text-gray-400">รอผลการตรวจสอบ</div>
        )}
      </div>
    </div>
  );
};

interface BankInfo {
  id: string;
  name: string;
  short: string;
}

interface NameInfo {
  th: string;
  en: string;
}

interface BankAccountInfo {
  type: string;
  account: string;
}

interface AccountInfo {
  name: NameInfo;
  bank: BankAccountInfo;
}

interface PartyInfo {
  bank: BankInfo;
  account: AccountInfo;
}

interface AmountInfo {
  amount: number;
  local: {
    amount: number;
    currency: string;
  };
}

interface TransactionData {
  status: number;
  data: {
    payload: string;
    transRef: string;
    date: string;
    countryCode: string;
    amount: AmountInfo;
    fee: number;
    ref1: string;
    ref2: string;
    ref3: string;
    sender: PartyInfo;
    receiver: PartyInfo;
  };
}

const TransactionDetails: React.FC<{ transaction: TransactionData }> = ({ transaction }) => {
  const [copied, setCopied] = useState<string | null>(null);

  // Handle cases where transaction might be null or invalid
  if (!transaction || !transaction.data) {
    return (
      <Card className="w-full shadow-sm border border-gray-100">
        <div className="text-center text-gray-500">ไม่พบข้อมูลธุรกรรม</div>
      </Card>
    );
  }

  const { data } = transaction;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  const formatAccount = (account: string) => {
    // Keep masked account format
    return account;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <Card
      className="w-full shadow-md border border-gray-100 rounded-xl overflow-hidden"
      styles={{ header: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" } }}
      title={
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CheckCircleFilled className="text-green-500 text-xl mr-2" />
            <span className="font-bold text-lg">รายละเอียดธุรกรรม</span>
          </div>
          <Tag color="green" className="px-3 py-1 text-sm font-medium rounded-full">
            สำเร็จ
          </Tag>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Transaction ID & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text type="secondary" className="text-xs block mb-1">
              หมายเลขธุรกรรม
            </Text>
            <div className="flex items-center">
              <Text className="font-medium">{data.transRef}</Text>
              <Tooltip title={copied === "transRef" ? "คัดลอกแล้ว!" : "คัดลอก"}>
                <CopyOutlined className={`ml-2 text-xs cursor-pointer ${copied === "transRef" ? "text-green-500" : "text-gray-400"}`} onClick={() => copyToClipboard(data.transRef, "transRef")} />
              </Tooltip>
            </div>
          </div>
          <div>
            <Text type="secondary" className="text-xs block mb-1">
              <CalendarOutlined className="mr-1" />
              วันเวลาที่ทำรายการ
            </Text>
            <Text className="font-medium">{formatDate(data.date)}</Text>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Amount */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text type="secondary" className="text-xs block mb-1">
            จำนวนเงิน
          </Text>
          <div className="flex justify-center">
            <Title level={2} className="m-0 text-blue-700">
              {data.amount.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
            </Title>
          </div>
          {data.fee > 0 && (
            <div className="text-center mt-1">
              <Text type="secondary" className="text-xs">
                ค่าธรรมเนียม: {data.fee.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
              </Text>
            </div>
          )}
        </div>

        {/* Transaction Flow */}
        <div className="relative">
          <Row gutter={[16, 16]} className="flex items-stretch">
            {/* Sender */}
            <Col xs={24} sm={11}>
              <Card className="h-full bg-gray-50 border border-gray-200">
                <div className="flex items-center mb-3">
                  {data.sender.bank.id && (
                    <Image
                      src={`/bank/${data.sender.bank.id}.png`}
                      alt={data.sender.bank.short}
                      width={32}
                      height={32}
                      onError={() => {
                        // Using Image from next/image doesn't support onError directly
                        // Error handling will need to use a different approach
                      }}
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <div>
                  <Text type="secondary" className="text-xs block">
                    จากบัญชี
                  </Text>
                  <Text className="text-sm font-medium">{data.sender.bank.name}</Text>
                </div>

                <div className="pl-2 mt-3">
                  <Text type="secondary" className="text-xs block mb-1">
                    ชื่อบัญชี
                  </Text>
                  <Text className="font-medium block mb-2">{data.sender.account.name.th}</Text>
                  <Text type="secondary" className="text-xs block mb-1">
                    เลขที่บัญชี
                  </Text>
                  <Text className="font-medium">{formatAccount(data.sender.account.bank.account)}</Text>
                </div>
              </Card>
            </Col>

            {/* Arrow */}
            <Col xs={24} sm={2} className="flex items-center justify-center">
              <div className="hidden sm:flex h-full items-center justify-center">
                <ArrowRightOutlined className="text-2xl text-blue-500" />
              </div>
              <div className="sm:hidden py-2">
                <div className="w-full flex justify-center">
                  <div className="transform rotate-90">
                    <ArrowRightOutlined className="text-2xl text-blue-500" />
                  </div>
                </div>
              </div>
            </Col>

            {/* Receiver */}
            <Col xs={24} sm={11}>
              <Card className="h-full bg-gray-50 border border-gray-200">
                <div className="flex items-center mb-3">
                  {data.receiver.bank.id && (
                    <Image
                      src={`/bank/${data.receiver.bank.id}.png`}
                      alt={data.receiver.bank.short}
                      width={32}
                      height={32}
                      onError={() => {
                        // Using Image from next/image doesn't support onError directly
                        // Error handling will need to use a different approach
                      }}
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <div>
                  <Text type="secondary" className="text-xs block">
                    ไปยังบัญชี
                  </Text>
                  <Text className="text-sm font-medium">{data.receiver.bank.name}</Text>
                </div>

                <div className="pl-2 mt-3">
                  <Text type="secondary" className="text-xs block mb-1">
                    ชื่อบัญชี
                  </Text>
                  <Text className="font-medium block mb-2">{data.receiver.account.name.th}</Text>
                  <Text type="secondary" className="text-xs block mb-1">
                    เลขที่บัญชี
                  </Text>
                  <Text className="font-medium">{formatAccount(data.receiver.account.bank.account)}</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* References if available */}
        {(data.ref1 || data.ref2 || data.ref3) && (
          <>
            <Divider className="my-4" />
            <div className="grid grid-cols-3 gap-4">
              {data.ref1 && (
                <div>
                  <Text type="secondary" className="text-xs block mb-1">
                    Ref 1
                  </Text>
                  <Text className="font-medium">{data.ref1}</Text>
                </div>
              )}
              {data.ref2 && (
                <div>
                  <Text type="secondary" className="text-xs block mb-1">
                    Ref 2
                  </Text>
                  <Text className="font-medium">{data.ref2}</Text>
                </div>
              )}
              {data.ref3 && (
                <div>
                  <Text type="secondary" className="text-xs block mb-1">
                    Ref 3
                  </Text>
                  <Text className="font-medium">{data.ref3}</Text>
                </div>
              )}
            </div>
          </>
        )}

        {/* Payload */}
        <Divider className="my-4" />
        <div>
          <Text type="secondary" className="text-xs block mb-1">
            Payload
          </Text>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs break-all">
            {data.payload}
            <Tooltip title={copied === "payload" ? "คัดลอกแล้ว!" : "คัดลอก"}>
              <CopyOutlined className={`ml-2 text-xs cursor-pointer ${copied === "payload" ? "text-green-500" : "text-gray-400"}`} onClick={() => copyToClipboard(data.payload, "payload")} />
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
};
