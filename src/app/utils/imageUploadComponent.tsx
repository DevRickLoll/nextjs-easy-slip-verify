import { DeleteOutlined, InboxOutlined, PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Modal, Upload, message } from "antd";
import Dragger from "antd/es/upload/Dragger";
import type { UploadChangeParam, UploadFile } from "antd/es/upload/interface";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export const FirstImageUpload: React.FC<{
  onChange: (info: UploadChangeParam<UploadFile>) => void;
  fileLimit: number;
  size: { width: string; height: string };
  text?: string;
}> = ({ onChange, fileLimit, size, text }) => {
  return (
    <Dragger
      accept="image/*"
      showUploadList={false}
      beforeUpload={(file) => {
        const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
          message.error("คุณสามารถอัปโหลดไฟล์ JPG/PNG เท่านั้น!");
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error("รูปภาพต้องมีขนาดเล็กกว่า 5MB!");
        }
        return isJpgOrPng && isLt5M;
      }}
      onChange={onChange}
      // style={{ width: "425px", height: "200px" }}
      style={{ width: size.width, height: size.height }}
    >
      <p className="ant-upload-drag-icon">{!text ? <InboxOutlined /> : <UploadOutlined />}</p>
      {fileLimit === 1 ? (
        <p className="ant-upload-text" style={{ fontSize: "12px" }}>
          {text || "คลิกหรือลากไฟล์มาที่นี่เพื่ออัพโหลด"}
        </p>
      ) : (
        <p className="ant-upload-text">{text || "คลิกหรือลากไฟล์มาที่นี่เพื่ออัพโหลด"}</p>
      )}
      {fileLimit === 1 ? (
        <></>
      ) : (
        <>
          <p className="ant-upload-hint">รองรับไฟล์ประเภท JPG, PNG ขนาดไม่เกิน 2 MB</p>
          <p className="ant-upload-hint">จำนวนไม่เกิน {fileLimit} ภาพ</p>
        </>
      )}
    </Dragger>
  );
};

export const AdditionalImageUpload: React.FC<{ onChange: (info: UploadChangeParam<UploadFile>) => void }> = ({ onChange }) => {
  return (
    <Upload
      accept="image/*"
      showUploadList={false}
      beforeUpload={(file) => {
        const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
          message.error("คุณสามารถอัปโหลดไฟล์ JPG/PNG เท่านั้น!");
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error("รูปภาพต้องมีขนาดเล็กกว่า 5MB!");
        }
        return isJpgOrPng && isLt5M;
      }}
      onChange={onChange}
    >
      <Button
        style={{
          width: "100px",
          height: "100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          bottom: "0",
        }}
      >
        <PlusCircleOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
        <span>เพิ่มรูปภาพ</span>
      </Button>
    </Upload>
  );
};

interface ImagePreviewProps {
  file: UploadFile;
  onRemove: () => void;
  isOriginalProductImage?: boolean;
  handleDeleteImagefromSetting?: () => void;
  index: number;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove, isOriginalProductImage = false, index, handleDeleteImagefromSetting }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [fileSize, setFileSize] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams<{ pageId: string }>();

  useEffect(() => {
    if (file.originFileObj) {
      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
      img.src = URL.createObjectURL(file.originFileObj);

      // Calculate file size
      const size = file.size || file.originFileObj.size;
      setFileSize(formatFileSize(size));
    }
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleDeleteClick = () => {
    if (isOriginalProductImage) {
      setIsModalVisible(true);
    } else {
      onRemove();
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "300px",
    height: "500px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const imageStyle: React.CSSProperties = {
    width: "300px",
    height: "500px",
    objectFit: "contain",
  };

  const deleteButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "8px",
    right: "8px",
    ...(isOriginalProductImage && {
      backgroundColor: isHovered ? "#ff7875" : "#ff4d4f",
      borderColor: isHovered ? "#ff7875" : "#ff4d4f",
      color: "white",
      transition: "all 0.3s ease",
      transform: isHovered ? "scale(1.1)" : "scale(1)",
    }),
  };

  return (
    <>
      <div style={containerStyle}>
        <img src={file.url || (file.originFileObj && URL.createObjectURL(file.originFileObj))} alt="Product image" style={imageStyle} />
        <Button
          icon={<DeleteOutlined />}
          onClick={handleDeleteClick}
          style={deleteButtonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...(isOriginalProductImage && {
            type: "primary",
            danger: true,
          })}
        />
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            background: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {fileSize}
        </div>
      </div>

      <Modal
        title="ยืนยันการลบรูปภาพ"
        open={isModalVisible}
        onOk={() => {
          if (handleDeleteImagefromSetting) {
            handleDeleteImagefromSetting();
            setIsDeleting(false);
            setIsModalVisible(false);
          }
        }}
        onCancel={handleModalCancel}
        okText="ลบรูปภาพ"
        cancelText="ยกเลิก"
        okButtonProps={{
          danger: true,
          loading: isDeleting,
        }}
        confirmLoading={isDeleting}
      >
        <p>คุณต้องการลบรูปภาพที่ {index + 1} ของสินค้านี้ใช่หรือไม่?</p>
        <p>การลบรูปภาพนี้จะมีผลต่อข้อมูลในระบบทันที</p>
      </Modal>
    </>
  );
};
