"use client";
import React, { useState, useEffect } from "react";

interface ProductImage {
  id: number;
  url: string;
  title: string;
}

interface ProductColor {
  id: number;
  name: string;
  code: string;
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  images: ProductImage[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  rating: number;
  reviews: number;
}

interface AddressData {
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export default function ProductPage() {
  const productData: ProductData = {
    id: "12345",
    title: "Tênis Esportivo Premium",
    description:
      "Tênis esportivo com tecnologia de amortecimento avançada para máximo conforto durante corridas e atividades físicas.",
    price: 299.99,
    discountPrice: 249.99,
    images: [
      {
        id: 1,
        url: "https://m.media-amazon.com/images/I/51JOXDYNeXL._AC_SY500_.jpg",
        title: "adidas Men's Barreda Sneaker",
      },
      {
        id: 2,
        url: "https://m.media-amazon.com/images/I/71Ofnl+cw+L._AC_SX500_.jpg",
        title: "adidas Men's Barricade Clay Tennis Shoe",
      },
      {
        id: 3,
        url: "https://m.media-amazon.com/images/I/71DZ2p2173L._AC_SX500_.jpg",
        title: "adidas Men's Run Falcon 5 Sneaker",
      },
    ],
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: [
      { id: 1, name: "Preto", code: "#000000" },
      { id: 2, name: "Branco", code: "#FFFFFF" },
      { id: 3, name: "Azul Marinho", code: "#000080" },
      { id: 4, name: "Vermelho", code: "#FF0000" },
    ],
    stock: 15,
    rating: 4.5,
    reviews: 128,
  };

  const [mainImage, setMainImage] = useState<ProductImage>(
    productData.images[0]
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cep, setCep] = useState<string>("");
  const [address, setAddress] = useState<AddressData | null>(null);
  const [cepError, setCepError] = useState<string>("");
  const [isLoadingCep, setIsLoadingCep] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  useEffect(() => {
    const savedData = localStorage.getItem("productPageData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const savedTime = new Date(parsedData.timestamp);
        const now = new Date();

        if (now.getTime() - savedTime.getTime() < 15 * 60 * 1000) {
          setSelectedSize(parsedData.selectedSize || "");
          setSelectedColor(parsedData.selectedColor || "");
          setQuantity(parsedData.quantity || 1);
          setCep(parsedData.cep || "");
          setAddress(parsedData.address || null);

          if (parsedData.mainImageId) {
            const savedImage = productData.images.find(
              (img) => img.id === parsedData.mainImageId
            );
            if (savedImage) setMainImage(savedImage);
          }
        } else {
          localStorage.removeItem("productPageData");
        }
      } catch (error) {
        console.error("Erro ao ler dados salvos:", error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      mainImageId: mainImage.id,
      selectedSize,
      selectedColor,
      quantity,
      cep,
      address,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("productPageData", JSON.stringify(dataToSave));
  }, [mainImage, selectedSize, selectedColor, quantity, cep, address]);

  const handleCepSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cep || cep.length !== 8 || !/^\d+$/.test(cep)) {
      setCepError("CEP inválido. Digite 8 números.");
      return;
    }

    setCepError("");
    setIsLoadingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: AddressData = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
        setAddress(null);
      } else {
        setAddress(data);
      }
    } catch (error) {
      setCepError("Erro ao consultar CEP. Tente novamente.");
      setAddress(null);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const adjustQuantity = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= productData.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert(
        "Por favor, selecione tamanho e cor antes de adicionar ao carrinho"
      );
      return;
    }

    setIsAddingToCart(true);
    setTimeout(() => {
      alert(
        `Produto adicionado ao carrinho!\n\nTamanho: ${selectedSize}\nCor: ${
          productData.colors.find((c) => c.code === selectedColor)?.name
        }\nQuantidade: ${quantity}`
      );
      setIsAddingToCart(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/5">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <img
              src={mainImage.url}
              alt={mainImage.title}
              className="w-full h-96 object-contain p-4"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {productData.images.map((image) => (
              <button
                key={image.id}
                onClick={() => setMainImage(image)}
                className={`border-2 rounded overflow-hidden transition-all ${
                  mainImage.id === image.id
                    ? "border-blue-500 scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                aria-label={`Visualizar ${image.title}`}
              >
                <img
                  src={image.url}
                  alt={`Miniatura ${image.title}`}
                  className="w-full h-20 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="md:w-3/5">
          <h1 className="text-3xl font-bold text-white mb-2">
            {productData.title}
          </h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(productData.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-zinc-300 ml-2">
              {productData.rating} ({productData.reviews} avaliações)
            </span>
          </div>

          <div className="mb-6">
            <p className="text-zinc-300">{productData.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-white">
                R$ {productData.discountPrice.toFixed(2)}
              </span>
              {productData.discountPrice < productData.price && (
                <span className="ml-2 text-lg text-gray-400 line-through">
                  R$ {productData.price.toFixed(2)}
                </span>
              )}
              {productData.discountPrice < productData.price && (
                <span className="ml-2 bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                  {Math.round(
                    (1 - productData.discountPrice / productData.price) * 100
                  )}
                  % OFF
                </span>
              )}
            </div>
            <p
              className={`font-medium mt-1 ${
                productData.stock > 10 ? "text-green-500" : "text-yellow-500"
              }`}
            >
              {productData.stock > 10
                ? "Em estoque"
                : `Últimas ${productData.stock} unidades!`}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Tamanho</h3>
            <div className="flex flex-wrap gap-2">
              {productData.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    selectedSize === size
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-zinc-800 text-zinc-200 border-zinc-600 hover:bg-zinc-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Cor</h3>
            <div className="flex flex-wrap gap-3">
              {productData.colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.code)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedColor === color.code
                      ? "border-blue-500 scale-110"
                      : "border-zinc-400 hover:border-zinc-200"
                  }`}
                  style={{ backgroundColor: color.code }}
                  title={color.name}
                  aria-label={color.name}
                >
                  {selectedColor === color.code && (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Quantidade</h3>
            <div className="flex items-center">
              <button
                onClick={() => adjustQuantity(-1)}
                className="bg-zinc-700 text-zinc-200 px-3 py-1 rounded-l-md hover:bg-zinc-600 disabled:opacity-50"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="bg-zinc-800 text-white px-4 py-1">
                {quantity}
              </span>
              <button
                onClick={() => adjustQuantity(1)}
                className="bg-zinc-700 text-zinc-200 px-3 py-1 rounded-r-md hover:bg-zinc-600 disabled:opacity-50"
                disabled={quantity >= productData.stock}
              >
                +
              </button>
              <span className="text-zinc-400 ml-2 text-sm">
                Disponível: {productData.stock}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex-1 transition-colors"
              onClick={() => alert("Compra rápida não implementada")}
            >
              Comprar agora
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-md font-medium flex-1 transition-colors disabled:opacity-75"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adicionando...
                </span>
              ) : (
                "Adicionar ao carrinho"
              )}
            </button>
          </div>

          {/* Consulta de CEP */}
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-3">
              Calcular frete e prazo
            </h3>
            <form onSubmit={handleCepSearch} className="flex gap-2">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                placeholder="Digite seu CEP"
                maxLength={8}
                className="flex-1 border border-zinc-600 bg-zinc-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                disabled={isLoadingCep}
              >
                {isLoadingCep ? "Consultando..." : "Calcular"}
              </button>
            </form>

            {cepError && (
              <p className="text-red-400 mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {cepError}
              </p>
            )}

            {address && (
              <div className="mt-4 bg-zinc-800 p-3 rounded-md">
                <p className="font-medium text-white">Endereço encontrado:</p>
                {address.logradouro && (
                  <p className="text-zinc-300">
                    {address.logradouro}, {address.bairro}
                  </p>
                )}
                <p className="text-zinc-300">
                  {address.localidade} - {address.uf}
                </p>
                <p className="mt-2 text-green-400 font-medium">
                  Frete disponível para esta região
                </p>
                <p className="text-sm text-zinc-400">
                  Prazo estimado: 3-5 dias úteis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
