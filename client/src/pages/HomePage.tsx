import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { api, type Destination, type Paged, type Room } from "../api/client";
import { RoomCard } from "../components/RoomCard";

const SLIDES = [
  { img: "/img/slides/slide-1.jpg", title: "Hiện đại" },
  { img: "/img/slides/slide-2.jpg", title: "Tinh tế" },
  { img: "/img/slides/slide-3.jpg", title: "Sang trọng" },
];

const OFFERS = [
  {
    img: "/img/uu-dai/img-3.jpg",
    title: "Năm mới hành trình mới",
    text: "Tiết kiệm từ 15% khi đặt và lưu trú trước 1/4/2024",
  },
  {
    img: "/img/uu-dai/img-4.jpg",
    title: "Làm việc thư giãn hay cả 2",
    text: "Khám phá các chỗ nghỉ cho phép lưu trú dài ngày với giá theo tháng tiết kiệm hơn",
  },
];

const DESTINATION_IMAGES: Record<string, string> = {
  "Hạ Long": "/img/location/ha-long.jpg",
  "Nha Trang": "/img/location/nha-trang.jpg",
  "Đà Lạt": "/img/location/da-lat.jpg",
  "Đà Nẵng": "/img/location/da-nang.jpg",
};

const TESTIMONIALS = [
  {
    img: "/img/testimonials/t1.jpg",
    avatar: "/img/testimonials/t1-avatar.jpg",
    author: "Elisa",
    text: "Tốc độ truy cập trang web Hostay rất nhanh, giúp tôi có trải nghiệm tốt khi sử dụng.",
  },
  {
    img: "/img/testimonials/t2.jpg",
    avatar: "/img/testimonials/t2-avatar.jpg",
    author: "Pablo",
    text: "Tôi đánh giá cao dịch vụ khách hàng của Hostay, với đội ngũ nhân viên nhiệt tình, sẵn sàng hỗ trợ khách hàng 24/7.",
  },
];

function SectionTitle({ title, linkToRooms = false }: { title: string; linkToRooms?: boolean }) {
  return (
    <div className="row">
      <div className="col-md-12">
        <div className="title-wrap d-flex justify-content-between pb-5">
          <div className="title-box">
            <h2 className="title-a">{title}</h2>
          </div>
          {linkToRooms && (
            <div className="title-link">
              <Link to="/rooms">
                Tất cả phòng
                <span className="bi bi-chevron-right" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Xem ảnh phóng to trong album (thay cho thư viện lightGallery của bản cũ) */
function Lightbox({ images, index, onChange }: { images: string[]; index: number; onChange: (i: number | null) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onChange((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onChange]);

  return (
    <div className="album-lightbox" role="dialog" aria-modal="true" aria-label="Album ảnh" onClick={() => onChange(null)}>
      <img src={images[index]} alt="" onClick={(e) => e.stopPropagation()} />
      <button className="lb-close" aria-label="Đóng" onClick={() => onChange(null)}>
        <i className="bi bi-x" />
      </button>
      <button
        className="lb-prev"
        aria-label="Ảnh trước"
        onClick={(e) => {
          e.stopPropagation();
          onChange((index - 1 + images.length) % images.length);
        }}
      >
        <i className="bi bi-chevron-left" />
      </button>
      <button
        className="lb-next"
        aria-label="Ảnh sau"
        onClick={(e) => {
          e.stopPropagation();
          onChange((index + 1) % images.length);
        }}
      >
        <i className="bi bi-chevron-right" />
      </button>
      <span className="lb-count">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}

/** Trang chủ, chuyển từ views/index.php */
export function HomePage() {
  const [latest, setLatest] = useState<Room[]>([]);
  const [album, setAlbum] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);

  useEffect(() => {
    api<Paged<Room>>("/rooms?pageSize=5")
      .then((r) => setLatest(r.items))
      .catch(() => setLatest([]));
    api<Paged<Room>>("/rooms?pageSize=30")
      .then((r) => setAlbum(r.items.map((i) => i.image).filter((i): i is string => !!i)))
      .catch(() => setAlbum([]));
    api<Destination[]>("/rooms/destinations").then(setDestinations).catch(() => setDestinations([]));
  }, []);

  return (
    <>
      {/* ======= Intro Section ======= */}
      <div className="intro intro-carousel position-relative">
        <Swiper
          className="h-100"
          modules={[Autoplay, Pagination]}
          speed={600}
          loop
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ el: ".intro-pagination", clickable: true }}
        >
          {SLIDES.map((s) => (
            <SwiperSlide key={s.img}>
              <div className="carousel-item-a intro-item bg-image" style={{ backgroundImage: `url(${s.img})` }}>
                <div className="overlay overlay-a" />
                <div className="intro-content display-table">
                  <div className="table-cell">
                    <div className="container">
                      <div className="row">
                        <div className="col-lg-8">
                          <div className="intro-body">
                            <h1 className="intro-title mb-4">{s.title}</h1>
                            <p className="intro-subtitle intro-price">
                              <Link to="/rooms">
                                <span className="price-a">Đặt phòng ngay</span>
                              </Link>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-pagination intro-pagination" />
      </div>

      <main id="main">
        {/* Ưu đãi */}
        <section className="section-property section-t8 pt-5" id="uu-dai">
          <div className="container">
            <SectionTitle title="Ưu đãi" />
            <div className="row">
              {OFFERS.map((o) => (
                <div className="card col-md-6 border-0 rounded-0 my-1" key={o.title}>
                  <div
                    className="card-body rounded text-white"
                    style={{ backgroundImage: `url(${o.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    <h5 className="card-title">{o.title}</h5>
                    <p className="card-text">{o.text}</p>
                    <Link to="/rooms" className="card-link btn btn-primary mb-0 mt-auto">
                      Khám phá
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mới nhất */}
        <section className="section-property section-t8 pt-5" id="moi-nhat">
          <div className="container">
            <SectionTitle title="Mới nhất" linkToRooms />
            {latest.length > 0 ? (
              <Swiper
                id="property-carousel"
                modules={[Autoplay, Pagination]}
                speed={600}
                loop={latest.length > 3}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ el: ".propery-carousel-pagination", clickable: true }}
                breakpoints={{ 320: { slidesPerView: 1, spaceBetween: 20 }, 1200: { slidesPerView: 3, spaceBetween: 20 } }}
              >
                {latest.map((room) => (
                  <SwiperSlide className="carousel-item-b" key={room.id}>
                    <RoomCard room={room} detailLabel="Click để xem chi tiết" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p>Không thể lấy dữ liệu!</p>
            )}
            <div className="propery-carousel-pagination carousel-pagination" />
          </div>
        </section>

        {/* Địa điểm phổ biến */}
        <section className="section-property section-t8 pt-5" id="dia-diem">
          <div className="container">
            <SectionTitle title="Địa điểm phổ biến" linkToRooms />
            <div className="row">
              {destinations.map((d) => (
                <Link to={`/rooms?address=${encodeURIComponent(d.name)}`} className="card border-0 py-0 col-md-3 col-sm-6" key={d.name}>
                  <img src={DESTINATION_IMAGES[d.name]} className="card-img-top loc-img" alt={d.name} style={{ objectFit: "cover" }} />
                  <div className="card-body p-1">
                    <p className="card-text mb-0 fw-bold">{d.name}</p>
                    <p className="card-text" style={{ fontSize: 14 }}>
                      {d.count} điểm dừng
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Đánh giá */}
        <section className="section-testimonials section-t8 pt-5 nav-arrow-a" id="danh-gia">
          <div className="container">
            <SectionTitle title="Đánh giá" />
            <Swiper
              id="testimonial-carousel"
              modules={[Autoplay, Pagination]}
              speed={600}
              loop
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ el: ".testimonial-carousel-pagination", clickable: true }}
            >
              {TESTIMONIALS.map((t) => (
                <SwiperSlide className="carousel-item-a" key={t.author}>
                  <div className="testimonials-box">
                    <div className="row">
                      <div className="col-sm-12 col-md-6">
                        <div className="testimonial-img">
                          <img src={t.img} alt="" className="img-fluid" />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="testimonial-ico">
                          <i className="bi bi-chat-quote-fill" />
                        </div>
                        <div className="testimonials-content">
                          <p className="testimonial-text">{t.text}</p>
                        </div>
                        <div className="testimonial-author-box">
                          <img src={t.avatar} alt="" className="testimonial-avatar" />
                          <h5 className="testimonial-author">{t.author}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="testimonial-carousel-pagination carousel-pagination" />
          </div>
        </section>

        {/* Albums */}
        <section className="section-property section-t8 pt-5" id="albums">
          <div className="container">
            <SectionTitle title="Albums" />
            <div className="row lightgallery">
              {album.slice(0, 6).map((img, i) => (
                <a
                  className="col-4 gallery-show"
                  href={img}
                  key={img}
                  onClick={(e) => {
                    e.preventDefault();
                    setViewing(i);
                  }}
                >
                  {/* Ô cuối hiển thị số ảnh còn lại, giống bản cũ */}
                  <div className="gallery-icon" data-number={`+${Math.max(album.length - 5, 0)}`} />
                  <img src={img} alt="" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {viewing !== null && <Lightbox images={album} index={viewing} onChange={setViewing} />}
    </>
  );
}
