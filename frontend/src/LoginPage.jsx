import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Đăng nhập demo thành công!");
    navigate("/products");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Đăng nhập</h1>

      <form
        onSubmit={handleLogin}
        style={{
          width: "350px",
          margin: "30px auto",
          padding: "25px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          style={{
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          style={{
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}

export default LoginPage;