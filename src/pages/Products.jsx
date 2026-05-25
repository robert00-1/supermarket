import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
    stock: "",
    category: "General",
    image: null,
    description: "",
    manufactureDate: "",
    expiryDate: "",
  });

  /* =========================
     IMAGE FIX HELPER
  ========================= */
  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads/")) {
      return `http://localhost:5000${img}`;
    }
    return `http://localhost:5000/uploads/${img}`;
  };

  /* =========================
     FETCH PRODUCTS
  ========================= */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/products"
      );
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     INPUT HANDLERS
  ========================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    setForm({
      ...form,
      image: e.target.files[0],
    });
  };

  /* =========================
     ADD PRODUCT
  ========================= */
  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("barcode", form.barcode);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category);
      data.append("description", form.description);
      data.append("manufactureDate", form.manufactureDate);
      data.append("expiryDate", form.expiryDate);

      if (form.image) {
        data.append("image", form.image);
      }

      await axios.post(
        "http://localhost:5000/api/products",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Product Added");

      setShowModal(false);

      setForm({
        name: "",
        barcode: "",
        price: "",
        stock: "",
        category: "General",
        image: null,
        description: "",
        manufactureDate: "",
        expiryDate: "",
      });

      fetchProducts();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error adding product");
    }
  };

  /* =========================
     RESTOCK
  ========================= */
  const handleRestock = async (id) => {
    try {
      const quantity = prompt("Enter quantity to add");
      if (!quantity) return;

      await axios.put(
        `http://localhost:5000/api/products/restock/${id}`,
        { quantity }
      );

      alert("✅ Stock updated");
      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Restock failed");
    }
  };

  /* =========================
     DELETE PRODUCT (NEW)
  ========================= */
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product?"
      );

      if (!confirmDelete) return;

      await axios.delete(
        `http://localhost:5000/api/products/${id}`
      );

      alert("🗑️ Product deleted");

      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Products</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full">

          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Barcode</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Expiry</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">

                {/* IMAGE */}
                <td className="p-3">
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                </td>

                <td className="p-3 font-semibold">{p.name}</td>
                <td className="p-3">{p.barcode}</td>
                <td className="p-3 text-green-700 font-bold">
                  KES {p.price}
                </td>

                <td className="p-3">
                  <span className={
                    p.stock <= 5
                      ? "text-red-600 font-bold"
                      : "text-green-600 font-bold"
                  }>
                    {p.stock}
                  </span>
                </td>

                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.expiryDate || "--"}</td>

                {/* ACTIONS */}
                <td className="p-3 flex gap-2">

                  {/* RESTOCK */}
                  <button
                    onClick={() => handleRestock(p._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Restock
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <form
            onSubmit={addProduct}
            className="bg-white p-6 rounded-xl w-[450px] space-y-3"
          >

            <h2 className="text-xl font-bold">Add Product</h2>

            <input name="name" placeholder="Name" onChange={handleChange} className="border p-2 w-full" />
            <input name="barcode" placeholder="Barcode" onChange={handleChange} className="border p-2 w-full" />
            <input name="price" placeholder="Price" onChange={handleChange} className="border p-2 w-full" />
            <input name="stock" placeholder="Stock" onChange={handleChange} className="border p-2 w-full" />
            <input name="category" placeholder="Category" onChange={handleChange} className="border p-2 w-full" />

            <input type="file" onChange={handleImage} className="border p-2 w-full" />

            <textarea name="description" onChange={handleChange} className="border p-2 w-full" />

            <input type="date" name="manufactureDate" onChange={handleChange} className="border p-2 w-full" />
            <input type="date" name="expiryDate" onChange={handleChange} className="border p-2 w-full" />

            <button className="bg-green-600 text-white w-full p-2">
              Save Product
            </button>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-500 text-white w-full p-2 mt-2"
            >
              Cancel
            </button>

          </form>

        </div>
      )}

    </div>
  );
}