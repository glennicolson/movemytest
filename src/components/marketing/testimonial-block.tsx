import Link from "next/link";
import { getVisibleReviews } from "@/features/reviews/actions";

const fallbackTestimonials = [
  {
    quote: "I booked my first lesson with MoveMyTest and was immediately impressed by how customised the plan felt. After just 35 hours, I passed the practical test on my second attempt!",
    name: "J. Patel",
    location: "Dumfries",
  },
  {
    quote: "Being a Polish speaker, MoveMyTest's bilingual instructor made the whole process stress-free. The lessons were thorough and focused on Edinburgh's tricky roundabouts.",
    name: "A. Kowalski",
    location: "Musselburgh",
  },
  {
    quote: "They have modern cars, and the automatic lessons were a breeze. I'm now cruising around Lockerbie with confidence.",
    name: "S. Ahmed",
    location: "Dalkeith",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-[#fbbc04]" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.3v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.08z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.65-2.07.01-.77z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function relativeDateLabel(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const day = 1000 * 60 * 60 * 24;
  const days = Math.max(1, Math.floor(diffMs / day));
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export async function TestimonialBlock() {
  const reviews = await getVisibleReviews();
  const displayed = reviews.slice(0, 3);
  const averageRating = displayed.length
    ? Math.round((displayed.reduce((sum: any, review: any) => sum + review.rating, 0) / displayed.length) * 10) / 10
    : null;

  if (displayed.length > 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold text-slate-900">What Learners Say</h2>
          {averageRating ? (
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
              <GoogleIcon />
              <span className="text-sm font-semibold text-slate-900">{averageRating}</span>
              <span className="text-sm text-slate-600">Google Reviews</span>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((review: any) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-semibold text-white">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{review.authorName}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <StarRating rating={review.rating} />
                      <span>{relativeDateLabel(new Date(review.reviewedAt))}</span>
                    </div>
                  </div>
                </div>
                <GoogleIcon />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                {review.text.length > 320 ? `${review.text.slice(0, 320)}…` : review.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.google.com/maps/place/The+Driving+Training+Centre+Ltd/@55.5625392,-4.2815605,9z/data=!3m1!4b1!4m6!3m5!1s0x4887bf5b0da0700b:0x605c0ce95df11d62!8m2!3d55.5643082!4d-3.6222915!16s%2Fg%2F1tdvd4s1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            <GoogleIcon />
            See all reviews on Google
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-3xl font-bold text-slate-900">What Learners Say</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {fallbackTestimonials.map((testimonial) => (
          <blockquote
            key={testimonial.name}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm leading-relaxed text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
            <footer className="mt-4 text-sm font-semibold text-slate-900">
              {testimonial.name}, {testimonial.location}
            </footer>
          </blockquote>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/contact" className="text-sm font-medium text-[var(--brand)] hover:underline">
          Join our learners, enquire about lessons
        </Link>
      </div>
    </section>
  );
}