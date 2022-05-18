import React from 'react';
import { getAuth, deleteUser } from 'firebase/auth';
import { useRouter } from 'next/router';

function DropOut() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleDeleteUser = () => {
    const dialog = confirm('정말 탈퇴하시겠습니까?');
    if (dialog) {
      deleteUser(user)
        .then(() => {
          alert('탈퇴가 완료되었습니다.');
          router.push('/Login');
        })
        .catch((error) => {
          console.log(error);
          router.push('/Login');
        });
    }
  };

  return (
    <div>
      <button onClick={() => handleDeleteUser()}>탈퇴하기</button>
    </div>
  );
}

export default DropOut;
