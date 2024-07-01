import React, { useState, useEffect } from "react";

// 회원 데이터 타입 정의
interface Member {
  id: string;
  nickname: string;
  email: string;
  loginType: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface AdminUserFormProps {
  data: Member[];
}

const AdminUserForm = ({ data }: AdminUserFormProps) => {
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);

  //검색, 삭제 용도
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  //검색 주의사항, 검색은 시설명으로 진행
  //삭제는 id값 사용
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setMembers(
      data
        .filter((member) => member.nickname.includes(searchTerm))
        .slice(startIndex, endIndex),
    );
  }, [page, data, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setPage(1); // Reset to the first page on a new search
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleDelete = () => {
    const newData = data.filter((member) => !selectedIds.has(member.id));
    setSelectedIds(new Set());
    // Assuming you want to update the parent component with newData
    // Pass newData to a callback function from the parent if needed
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-end w-full items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="닉네임을 입력하세요"
            className="border p-2"
          />
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-[#3F51B5] text-white rounded"
            style={{ minWidth: "64px" }}
          >
            검색
          </button>
        </div>
        <button
          onClick={handleDelete}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
          style={{ minWidth: "64px" }} // 추가된 부분: 버튼 최소 너비 지정
        >
          삭제
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead className="bg-[#3F51B5] text-white">
          <tr>
            <th className="py-2">
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedIds(
                    e.target.checked
                      ? new Set(members.map((m) => m.id))
                      : new Set(),
                  )
                }
              />
            </th>
            <th className="py-2">No.</th>
            <th className="py-2">아이디</th>
            <th className="py-2">닉네임</th>
            <th className="py-2">이메일</th>
            <th className="py-2">로그인 타입</th>
            <th className="py-2">유저 권한</th>
            <th className="py-2">블락</th>
            <th className="py-2">가입 일시</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={member.id} className="text-center">
              <td className="py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(member.id)}
                  onChange={() => handleSelect(member.id)}
                />
              </td>
              <td className="py-2">{(page - 1) * itemsPerPage + index + 1}</td>
              <td className="py-2">{member.id}</td>
              <td className="py-2">{member.nickname}</td>
              <td className="py-2">{member.email}</td>
              <td className="py-2">{member.loginType}</td>
              <td className="py-2">{member.role}</td>
              <td className="py-2">{member.isBlocked ? "Yes" : "No"}</td>
              <td className="py-2">
                {new Date(member.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center items-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          이전
        </button>
        <span className="mx-4">
          {page} / {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default AdminUserForm;
