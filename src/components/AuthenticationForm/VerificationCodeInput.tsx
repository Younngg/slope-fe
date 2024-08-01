import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import useVerificationCode from "./useVerificationCode";

interface VerificationCodeInputProps {
  email: string;
  domain: string;
  customDomain: string;
  pageType: "register" | "recovery";
  onVerify: (isVerified: boolean) => void;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  email,
  domain,
  customDomain,
  pageType,
  onVerify,
}) => {
  const {
    verificationCode,
    setVerificationCode,
    isVerified,
    setIsVerified,
    timer,
    isButtonDisabled,
    message,
    messageType,
    handleSendVerificationCode,
    handleVerify,
    formatTime,
    error,
  } = useVerificationCode(email, domain, customDomain, pageType);

  const [localError, setLocalError] = useState("");

  const handleSendCodeClick = () => {
    setLocalError("");
    handleSendVerificationCode();
  };

  const handleVerifyClick = async () => {
    const verified = await handleVerify();
    setIsVerified(verified);
    onVerify(verified);
    setLocalError(verified ? "" : "인증에 실패했습니다. 다시 시도해 주세요.");
  };

  return (
    <div className="w-[300px]">
      <div className="flex justify-between items-center mb-4">
        {timer > 0 && (
          <div className="text-center text-black-500 text-2xl">
            {formatTime(timer)}
          </div>
        )}
        <button
          className={`h-[40px] rounded-lg ${
            isButtonDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-signiture text-white"
          } ${timer > 0 ? "w-[50%]" : "w-full"}`}
          onClick={handleSendCodeClick}
          disabled={isButtonDisabled}
        >
          인증번호 받기
        </button>
      </div>

      {message && (
        <div
          className={`text-sm mt-2 ${
            messageType === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      {error && ( // 오류 메시지 표시
        <div className="text-sm mt-2 text-red-500">{error}</div>
      )}

      {localError && (
        <div className="text-sm mt-2 text-red-500">{localError}</div>
      )}

      <div className="flex items-center mb-4">
        <input
          type="text"
          id="verificationCode"
          className="w-full border-b border-gray-400 py-2 outline-none"
          placeholder="인증번호 6자리 숫자 입력"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <button
          className={`w-[50px] h-[40px] ml-2 ${
            isVerified
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-signiture text-white"
          } rounded-lg`}
          onClick={handleVerifyClick}
          disabled={isVerified}
        >
          확인
        </button>
        {isVerified && <FaCheckCircle className="text-green-500 ml-2" />}
      </div>
    </div>
  );
};

export default VerificationCodeInput;
