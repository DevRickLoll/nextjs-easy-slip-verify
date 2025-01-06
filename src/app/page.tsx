"use client";
import { useState } from "react";

export default function Home() {
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
            alert("กรุณาเลือกไฟล์ก่อน!");
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
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_EASYSLIP_API_TOKEN}`, // ใช้ Token จาก .env
                },
                body: formData, // FormData จะจัดการ Content-Type ให้เอง
            });

            const data = await response.json();
            setResponseMessage(JSON.stringify(data, null, 2));

            if (data.status !== 200) {
                alert(`เกิดข้อผิดพลาด: ${data.message || "ไม่ทราบสาเหตุ"}`);
            } else {
                alert("ยืนยันการอัปโหลดสำเร็จ!");
            }
        } catch (error: any) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ API");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-4">อัปโหลดสลิปโอนเงิน</h1>
                <div className="mb-4">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                        เลือกไฟล์สลิป
                    </label>
                    <input
                        type="file"
                        id="file"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={handleFileChange}
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
                    disabled={isLoading}
                >
                    {isLoading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                </button>
                {responseMessage && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h2 className="text-sm font-bold">ผลลัพธ์จาก API:</h2>
                        <pre className="text-xs text-gray-600">{responseMessage}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
