function CartPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Giỏ hàng</h1>
      <p>Chức năng giỏ hàng sẽ được phát triển ở Session 12.</p>

      <div
        style={{
          margin: "30px auto",
          width: "400px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "white",
        }}
      >
        <h3>Giỏ hàng hiện đang trống</h3>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
      </div>
    </div>
  );
}

export default CartPage;