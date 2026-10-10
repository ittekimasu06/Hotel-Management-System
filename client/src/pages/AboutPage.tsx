import { IntroSingle } from "../components/IntroSingle";

/** Trang giới thiệu, chuyển từ views/about.php */
export function AboutPage() {
  return (
    <main id="main">
      <IntroSingle title="Giới thiệu về Hostay" crumbs={[{ label: "Giới thiệu" }]} />

      <section className="section-about">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 position-relative">
              <div className="about-img-box">
                <img src="/img/about/about-1.jpg" alt="" className="img-fluid" style={{ width: "100%" }} />
              </div>
              <div className="sinse-box">
                <h3 className="sinse-title">
                  Hostay
                  <span />
                  <br /> Sinse 2023
                </h3>
                <p>Tiện nghi &amp; Sang trọng</p>
              </div>
            </div>
            <div className="col-md-12 section-t8 position-relative">
              <div className="row">
                <div className="col-md-6 col-lg-5">
                  <img src="/img/about/about-2.jpg" alt="" className="img-fluid" />
                </div>
                <div className="col-lg-2 d-none d-lg-block position-relative">
                  <div className="title-vertical d-flex justify-content-start">
                    <span>Trải nghiệm kỳ nghỉ tuyệt vời</span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-5 section-md-t3">
                  <div className="title-box-d">
                    <h3 className="title-d">
                      Đa dạng <span className="color-d">màu sắc</span> và luôn
                      <br /> sẵn sàng.
                    </h3>
                  </div>
                  <p className="color-text-a">
                    Với mục tiêu mang đến cho khách hàng “Trải nghiệm kỳ nghỉ tuyệt vời”, Hostay kỳ vọng trở thành nền tảng du lịch nghỉ
                    dưỡng số 1 cho khách hàng Đông Nam Á trong 5 năm tới.
                  </p>
                  <p className="color-text-a">
                    Để đảm bảo cho khách hàng một “Trải nghiệm kỳ nghỉ tuyệt vời”, chúng tôi áp dụng công nghệ vào việc đọc hiểu nhu cầu
                    của thị trường, nghiên cứu phát triển sản phẩm và gợi ý những sản phẩm và dịch vụ tốt nhất, phù hợp với từng khách
                    hàng.
                  </p>
                  <p className="color-text-a">
                    Đề cao tính minh bạch, tôn trọng sự khác biệt, luôn luôn đi cùng nhau và không ngừng phát triển, tất cả những điều đó
                    đã tạo nên một Hostay đa dạng màu sắc và luôn sẵn sàng chào đón các bạn đến với chúng tôi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
