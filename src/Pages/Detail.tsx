import React, { useState, useEffect, useCallback, type ChangeEvent, type MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { FaStar, FaRegStar, FaTimes, FaEdit, FaTrash, FaUser } from "react-icons/fa";

// Define interfaces for data structures
interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  carpet_area: number;
  configuration: string;
  property_type: string;
  total_floors: number;
  total_units: number;
  status: string;
  rera_number: string;
  amenities: string[];
  developer_name: string;
  developer_tagline: string | null;
  developer_experience: number | null;
  developer_projects_completed: number | null;
  developer_happy_families: number | null;
  nearby_landmarks: { name: string; distance: string }[];
  agent_name: string | null;
  agent_role: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  agent_availability: string | null;
  agent_rating: number | null;
  agent_reviews: number | null;
  images: string | null;
  created_at: string | null;
  updated_at: string | null;
  agents_image: string | null;
  developer_id: string | null;
  developer_awards: string | null;
  developer_certifications: string | null;
  developer_description: string | null;
  developer_image: string | null;
  developer_logo: string | null;
  developer_rating: number | null;
  site_plan: string | null;
  tower_layout: string | null;
}

interface Image {
  src: string;
  alt: string;
}

interface FloorPlan {
  id: string;
  property_id: string;
  type: "residential" | "commercial";
  bhk: string;
  size: string;
  image: string;
  thumbnail: string | null;
}

interface EMIData {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
}

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  user_id: string;
  username: string;
}

interface EMICalculatorProps {
  property: Property | null;
}

interface CustomerReviewsProps {
  propertyId: string;
}

// EMICalculator Component
const EMICalculator: React.FC<EMICalculatorProps> = ({ property }) => {
  const [loanAmount, setLoanAmount] = useState<string>(
    property?.price ? property.price.toString() : ""
  );
  const [interestRate, setInterestRate] = useState<string>("");
  const [loanTenure, setLoanTenure] = useState<string>("");
  const [emiData, setEmiData] = useState<EMIData>({
    monthlyEMI: 0,
    totalInterest: 0,
    totalAmount: 0,
  });
  const [error, setError] = useState<string>("");

  const calculateEMI = useCallback(() => {
    setError("");
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTenure);

    if (!loanAmount || !interestRate || !loanTenure) {
      setError("Please fill in all fields.");
      setEmiData({ monthlyEMI: 0, totalInterest: 0, totalAmount: 0 });
      return;
    }

    if (
      isNaN(principal) ||
      isNaN(annualRate) ||
      isNaN(years) ||
      principal <= 0 ||
      annualRate <= 0 ||
      years <= 0
    ) {
      setError("Please enter valid positive numbers for all fields.");
      setEmiData({ monthlyEMI: 0, totalInterest: 0, totalAmount: 0 });
      return;
    }

    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    setEmiData({
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
    });
  }, [loanAmount, interestRate, loanTenure, setError, setEmiData]);

  useEffect(() => {
    if (loanAmount && interestRate && loanTenure) {
      calculateEMI();
    } else {
      setEmiData({ monthlyEMI: 0, totalInterest: 0, totalAmount: 0 });
    }
  }, [loanAmount, interestRate, loanTenure, calculateEMI]);

  return (
    <motion.section
      className="py-12 bg-stone-50"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">
          EMI Calculator
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter loan amount"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInterestRate(e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter interest rate"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Loan Tenure (Years)
                </label>
                <input
                  type="number"
                  value={loanTenure}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanTenure(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter loan tenure"
                  min="0"
                />
              </div>
              <button
                onClick={calculateEMI}
                className="relative inline-block w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors"
              >
                Calculate EMI
              </button>
            </div>
            <div className="bg-stone-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-stone-700 mb-4">
                EMI Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-stone-600">Monthly EMI</span>
                  <span className="text-xl font-bold text-blue-500">
                    {emiData.monthlyEMI
                      ? `₹${emiData.monthlyEMI.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-stone-600">Total Interest</span>
                  <span className="text-lg font-semibold text-stone-700">
                    {emiData.totalInterest
                      ? `₹${emiData.totalInterest.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-stone-600">Total Amount</span>
                  <span className="text-lg font-semibold text-stone-700">
                    {emiData.totalAmount
                      ? `₹${emiData.totalAmount.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// CustomerReviews Component
const CustomerReviews: React.FC<CustomerReviewsProps> = ({ propertyId }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [propertyOwnerId, setPropertyOwnerId] = useState<string | null>(null);

  const fetchPropertyData = useCallback(async (): Promise<{ developerRating: number; ownerId: string | null }> => {
    try {
      if (!propertyId) {
        setError("Property ID is missing.");
        return { developerRating: 0, ownerId: null };
      }

      const { data, error: fetchError } = await supabase
        .from("properties")
        .select("developer_rating, developer_id")
        .eq("id", propertyId)
        .single();

      if (fetchError) throw fetchError;

      return {
        developerRating: data?.developer_rating || 0,
        ownerId: data?.developer_id || null,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error fetching property data:", errorMessage);
      setError("Failed to load property data. Please try again.");
      return { developerRating: 0, ownerId: null };
    }
  }, [propertyId, setError]);

  const fetchUser = useCallback(async (): Promise<{ id: string; username: string } | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userData, error } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching username:", error.message);
        return { id: user.id, username: user.email?.split("@")[0] || 'User' };
      }

      return { id: user.id, username: userData.username || user.email?.split("@")[0] || 'User' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error fetching user:", errorMessage);
      return null;
    }
  }, []);

  const fetchReviews = useCallback(async (): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("id, rating, notes, created_at, user_id, username")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item: {
        id: string;
        rating?: number;
        notes?: string;
        created_at?: string;
        user_id: string;
        username?: string;
      }) => ({
        id: item.id,
        rating: item.rating || 0,
        reviewText: item.notes || "No feedback provided",
        createdAt: item.created_at || new Date().toISOString(),
        user_id: item.user_id,
        username: item.username || "Guest",
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error fetching reviews:", errorMessage);
      setError("Failed to load reviews. Please try again.");
      return [];
    }
  }, [propertyId, setError]);

  useEffect(() => {
    localStorage.removeItem(`reviews_${propertyId}`);

    const loadData = async () => {
      const { developerRating, ownerId } = await fetchPropertyData();
      const user = await fetchUser();
      const fetchedReviews = await fetchReviews();

      setCurrentUserId(user?.id || null);
      setPropertyOwnerId(ownerId);
      setReviews(fetchedReviews);
      setAverageRating(developerRating);
    };

    loadData();
  }, [propertyId, fetchPropertyData, fetchUser, fetchReviews]);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return sum / reviews.length;
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please provide a rating.");
      return;
    }

    if (rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    try {
      const user = await fetchUser();
      if (!user) {
        setError("You must be logged in to submit a review.");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          rating: rating,
          notes: reviewText.trim() || null,
          username: user.username,
        })
        .select("id, rating, notes, created_at, user_id, username")
        .single();

      if (insertError) {
        if (insertError.code === "42501") {
          throw new Error("Permission denied: You are not allowed to submit a review.");
        }
        throw new Error(insertError.message);
      }

      const newReview: Review = {
        id: data.id,
        rating: data.rating,
        reviewText: data.notes || "No feedback provided",
        createdAt: data.created_at || new Date().toISOString(),
        user_id: data.user_id,
        username: data.username || "Guest",
      };

      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);

      const newAverage = calculateAverageRating(updatedReviews);
      const { error: updateError } = await supabase
        .from("properties")
        .update({ developer_rating: newAverage })
        .eq("id", propertyId);

      if (updateError) {
        if (updateError.code === "42501") {
          throw new Error("Permission denied: Unable to update property rating.");
        }
        throw new Error(updateError.message);
      }

      setReviewText("");
      setRating(0);
      setShowForm(false);
      setError("");
      setAverageRating(newAverage);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error submitting review:", errorMessage);
      setError(`Failed to save review: ${errorMessage}. Please try again.`);
    }
  };

  const handleDelete = async (reviewId: string, reviewUserId: string) => {
    if (!currentUserId) {
      setError("You must be logged in to delete a review.");
      return;
    }

    if (currentUserId !== reviewUserId && currentUserId !== propertyOwnerId) {
      setError("You are not authorized to delete this review.");
      return;
    }

    const previousReviews = [...reviews];
    const updatedReviews = reviews.filter((review) => review.id !== reviewId);
    setReviews(updatedReviews);

    try {
      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", reviewId)
        .eq("property_id", propertyId);

      if (deleteError) {
        setReviews(previousReviews);
        if (deleteError.code === "42501") {
          throw new Error("Permission denied: You are not allowed to delete this review.");
        }
        throw new Error(deleteError.message);
      }

      const newAverage = calculateAverageRating(updatedReviews);
      const { error: updateError } = await supabase
        .from("properties")
        .update({ developer_rating: newAverage })
        .eq("id", propertyId);

      if (updateError) {
        setReviews(previousReviews);
        if (updateError.code === "42501") {
          throw new Error("Permission denied: Unable to update property rating.");
        }
        throw new Error(updateError.message);
      }

      setAverageRating(newAverage);
      setError("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error deleting review:", errorMessage);
      setError(`Failed to delete review: ${errorMessage}. Please try again.`);
    }
  };

  const handleClear = () => {
    setRating(0);
    setReviewText("");
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-stone-700">Customer Reviews</h2>
        {!showForm && (
          <button
            className="relative inline-flex items-center px-4 py-2 rounded-lg font-semibold text-white bg-stone-700 hover:bg-stone-800 transition-colors duration-300"
            onClick={() => setShowForm(true)}
          >
            <FaEdit className="mr-2" /> Add Review
          </button>
        )}
        {showForm && (
          <button
            onClick={() => setShowForm(false)}
            className="relative inline-flex items-center px-4 py-2 rounded-lg font-semibold text-white bg-stone-700 hover:bg-stone-800 transition-colors duration-300"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
        )}
      </div>
      <div className="text-yellow-500 mt-2 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {Array(5)
              .fill(0)
              .map((_, i) =>
                i < Math.round(averageRating) ? (
                  <FaStar key={i} />
                ) : (
                  <FaRegStar key={i} />
                )
              )}
          </div>
          <span className="text-black text-lg font-medium">{averageRating.toFixed(1) || 0}</span>
        </div>
        <p className="text-stone-600 text-sm">Average based on {reviews.length} entries</p>
      </div>
      <hr className="border-stone-200 mb-6" />
      {showForm && (
        <div className="bg-stone-50 border border-stone-200 p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-xl font-semibold text-stone-700 flex items-center gap-2 mb-4">
            <FaEdit /> Add Your Review
          </h3>
          <div className="flex gap-1 text-2xl mb-4">
            {Array(5)
              .fill(0)
              .map((_, i) =>
                i < (hoverRating || rating) ? (
                  <FaStar
                    key={i}
                    onClick={() => handleStarClick(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer text-yellow-500 hover:text-yellow-600"
                  />
                ) : (
                  <FaRegStar
                    key={i}
                    onClick={() => handleStarClick(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer text-yellow-300 hover:text-yellow-500"
                  />
                )
              )}
          </div>
          <textarea
            value={reviewText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
            className="w-full p-3 border border-stone-300 rounded-md focus:ring-stone-500 focus:border-transparent text-sm mb-4"
            rows={4}
            placeholder="Your feedback (optional)"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-stone-700 hover:bg-stone-800 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
      {!showForm && (
        <div>
          {reviews.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                  <div
                    key={review.id}
                    className="bg-stone-50 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-500">
                        {Array(5)
                          .fill(0)
                          .map((_, i) =>
                            i < Math.round(review.rating) ? (
                              <FaStar key={i} />
                            ) : (
                              <FaRegStar key={i} />
                            )
                          )}
                      </div>
                      <span className="text-stone-700 font-medium">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-stone-600 text-sm mb-2">
                      {review.reviewText || "No feedback provided"}
                    </p>
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <FaUser className="text-stone-500" /> {review.username}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                    {(currentUserId === review.user_id || currentUserId === propertyOwnerId) && (
                      <button
                        onClick={() => handleDelete(review.id, review.user_id)}
                        className="mt-2 text-stone-500 hover:text-stone-700 flex items-center gap-1 text-sm"
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {showAllReviews && reviews.length > 3 && (
                <p className="text-stone-600 text-sm mt-4 text-center">
                  <a
                    href="#"
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setShowAllReviews(false);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Close
                  </a>
                </p>
              )}
              {!showAllReviews && reviews.length > 3 && (
                <p className="text-stone-600 text-sm mt-4 text-center">
                  <a
                    href="#"
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setShowAllReviews(true);
                    }}
                    className="text-stone-600 hover:underline"
                  >
                    More Reviews
                  </a>
                </p>
              )}
            </div>
          )}
          {!showForm && reviews.length === 0 && (
            <p className="text-center text-stone-500 text-lg py-6">
              No reviews yet. Be the first to add your review!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Details Component
const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"unit-plans" | "site-plan" | "tower-layout">("unit-plans");
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) throw new Error("Property ID is missing");

        console.log("Fetching property with ID:", id);
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select(
            `
            id,
            name,
            location,
            price,
            carpet_area,
            configuration,
            property_type,
            total_floors,
            total_units,
            status,
            rera_number,
            amenities,
            developer_name,
            developer_tagline,
            developer_experience,
            developer_projects_completed,
            developer_happy_families,
            nearby_landmarks,
            agent_name,
            agent_role,
            agent_phone,
            agent_email,
            agent_availability,
            agent_rating,
            agent_reviews,
            images,
            created_at,
            updated_at,
            agents_image,
            developer_id,
            developer_awards,
            developer_certifications,
            developer_description,
            developer_image,
            developer_logo,
            developer_rating,
            site_plan,
            tower_layout
          `
          )
          .eq("id", id)
          .single();

        if (propertyError) {
          console.error("Property fetch error:", propertyError.message);
          throw new Error(`Failed to fetch property details: ${propertyError.message}`);
        }

        console.log("Fetched property:", propertyData);
        if (!propertyData) {
          throw new Error("Property not found");
        }

        const normalizedAmenities = Array.isArray(propertyData.amenities)
          ? propertyData.amenities
              .map((amenity: string) => {
                if (typeof amenity !== "string" || !amenity) return null;
                const trimmed = amenity.trim();
                return trimmed
                  .toLowerCase()
                  .replace(/(^|\s)\w/g, (char: string) => char.toUpperCase());
              })
              .filter((amenity: string | null): amenity is string => amenity !== null)
          : [];

        const landmarks =
          typeof propertyData.nearby_landmarks === "string"
            ? propertyData.nearby_landmarks.split(",").map((landmark: string) => {
                const [name, distance] = landmark
                  .split("(")
                  .map((s: string) => s.replace(")", "").trim());
                return { name, distance: distance || "N/A" };
              })
            : Array.isArray(propertyData.nearby_landmarks)
            ? propertyData.nearby_landmarks.map((l: { name?: string; distance?: string } | string) => ({
                name: typeof l === 'string' ? l : (l.name || 'Unknown'),
                distance: typeof l === 'string' ? "N/A" : (l.distance || "N/A"),
              }))
            : [];

        const { data: floorPlansData, error: floorPlansError } = await supabase
          .from("floor_plans")
          .select("*")
          .eq("property_id", id);

        if (floorPlansError) {
          console.error("Floor plans fetch error:", floorPlansError.message);
          throw new Error(`Failed to fetch floor plans: ${floorPlansError.message}`);
        }

        const mappedProperty: Property = {
          ...propertyData,
          amenities: normalizedAmenities,
          nearby_landmarks: landmarks,
        };

        setProperty(mappedProperty);
        setFloorPlans(floorPlansData || []);
        setImages(
          typeof propertyData.images === "string"
            ? propertyData.images.split(",").map((url: string, index: number) => ({
                src: url.trim(),
                alt: `${propertyData.name || "Property"} - Image ${index + 1}`,
              }))
            : Array.isArray(propertyData.images) && propertyData.images.length > 0
            ? propertyData.images.map((url: string, index: number) => ({
                src: url,
                alt: `${propertyData.name || "Property"} - Image ${index + 1}`,
              }))
            : []
        );

        setActivePlan(
          activeTab === "unit-plans"
            ? floorPlansData.find((plan: FloorPlan) => plan.type === "residential")?.image ||
              floorPlansData.find((plan: FloorPlan) => plan.type === "commercial")?.image ||
              "https://via.placeholder.com/800x600?text=No+Unit+Plan+Available"
            : activeTab === "site-plan"
            ? propertyData.site_plan ||
              "https://via.placeholder.com/800x600?text=No+Site+Plan+Available"
            : propertyData.tower_layout ||
              "https://via.placeholder.com/800x600?text=No+Tower+Layout+Available"
        );

        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Error fetching property:", errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, activeTab]);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images]);



  const handleTabChange = (tab: "unit-plans" | "site-plan" | "tower-layout") => {
    setActiveTab(tab);
    setActivePlan(
      tab === "unit-plans"
        ? floorPlans.find((plan) => plan.type === "residential")?.image ||
          floorPlans.find((plan) => plan.type === "commercial")?.image ||
          "https://via.placeholder.com/800x600?text=No+Unit+Plan+Available"
        : tab === "site-plan"
        ? property?.site_plan ||
          "https://via.placeholder.com/800x600?text=No+Site+Plan+Available"
        : property?.tower_layout ||
          "https://via.placeholder.com/800x600?text=No+Tower+Layout+Available"
    );
  };

  if (loading)
    return (
      <div className="col-span-full flex justify-center items-center min-h-screen h-72 w-auto"></div>
    );

  if (error || !property)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-700 flex-col">
        <p>{error || "Property not found"}</p>
        <button
          onClick={() => navigate("/listings")}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Back to Listings
        </button>
      </div>
    );

  const amenityImages: { [key: string]: string } = {
    "24/7 Security":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/24-7%20security.png",
    "Lift": "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/lift.png",
    "Parking":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/parking.png",
    "Garden":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/garden.jpeg",
    "Park": "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/garden.jpeg",
    "Swimming Pool":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/swimming%20pool.jpeg",
    "Gym": "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/gym.png",
    "Clubhouse":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/clubhouse.png",
    "Cctv Surveillance":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/cctv%20survelliance.png",
    "Childrens Play Area":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/children%20play%20area.png",
    "Mini Theater Room":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/mini%20theator.png",
    "Power Backup":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/power%20backup.png",
    "Motion Sensor Lighting":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/motion%20sensor.png",
    "Indoor Games Room":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/indoor%20games%20room.png",
    "Fire Safety Systems":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/fire%20safety%20systems.png",
    "Smart Lock Access":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/smart%20lock%20access.png",
    "Home Theater Room":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Home%20Theater%20Room.png",
    "Private Garden Seating Area":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Private%20Garden%20Seating%20Area.jpeg",
    "Rooftop Garden":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Rooftop%20Garden.png",
    "Air Conditioning In All Rooms":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Air%20Conditioning%20In%20All%20Rooms.jpeg",
    "Cctv": "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/cctv.png",
    "Gated Entry":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Gated%20Entry.png",
    "Park Area":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Park%20Area.png",
    "Security":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Security%20Guard.png",
    "Security Guard":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Security%20Guard.png",
    "Rainwater Harvesting":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Rainwater%20Harvesting.jpeg",
    "Terrace/balcony Sit-out":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Terrace-Balcony%20Sit-Out.png",
    "Video Door Phone":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Video%20Door%20Phone.png",
    "Wi-fi":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Wi-Fi.png",
    "Backup Generator":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Backup%20Generator.png",
    "Basement Parking":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Basement%20Parking.png",
    "Main Road Facing":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Main%20Road%20Facing.png",
    "Outdoor Seating Space":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Outdoor%20Seating%20Space.png",
    "Double Height Ceiling":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Double%20Height%20Ceiling.png",
    "Visitor Parking":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Visitor%20Parking.png",
    "Multiple Showroom Floors":
      "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Amenities/Multiple%20Showroom%20Floors.png",
  };

  return (
    <div className="min-h-screen">
      <section className="relative">
        <motion.div
          className="relative h-[80vh] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={
              images.length > 0
                ? images[0].src
                : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&h=500&q=80"
            }
            alt={property.name || "Property Exterior"}
            className="w-full h-[80vh] object-center"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              console.error("Failed to load hero image:", e.currentTarget.src);
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&h=500&q=80";
            }}
          />
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="px-4 max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                {property.name}
              </h1>
              <p className="text-xl md:text-2xl max-w-xl mx-auto">
                {property.developer_tagline || "Premium Living"}
              </p>
              <p className="text-lg opacity-90">{property.location}</p>
            </div>
          </motion.div>
        </motion.div>
      </section>
      <motion.section
        className="sticky top-16 bg-white shadow-md z-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 md:gap-4 text-center">
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                ₹{property.price.toLocaleString("en-IN")}
              </div>
              <div className="text-sm text-stone-600">Price</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                {property.carpet_area} sq.ft
              </div>
              <div className="text-sm text-stone-600">Carpet Area</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                {property.configuration}
              </div>
              <div className="text-sm text-stone-600">Configuration</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                {property.property_type}
              </div>
              <div className="text-sm text-stone-600">Type</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                {property.total_floors} Floors
              </div>
              <div className="text-sm text-stone-600">Total Floors</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                {property.total_units} Units
              </div>
              <div className="text-sm text-stone-600">Total Units</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-900">
                {property.status}
              </div>
              <div className="text-sm text-stone-600">Status</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">
                {property.rera_number}
              </div>
              <div className="text-sm text-stone-600">RERA Number</div>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700">
            Project Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-lg text-stone-700 mb-1 leading-relaxed">
                {property.name} is a premier residential project in{" "}
                {property.location}, showcasing modern architecture and luxury
                living.
              </p>
              <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                Featuring {property.configuration} apartments, it offers
                spacious layouts and top-tier amenities, with excellent
                connectivity to IT hubs.
              </p>
              <h3 className="text-xl font-bold text-stone-700 mb-4">
                Key Highlights
              </h3>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <span className="text-stone-700 mr-2 text-lg">•</span>
                  <span className="text-stone-700">
                    Prime {property.location} location with great connectivity
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-stone-700 mr-2 text-lg">•</span>
                  <span className="text-stone-700">
                    {property.total_floors}-floor tower with city views
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-stone-700 mr-2 text-lg">•</span>
                  <span className="text-stone-700">
                    Clubhouse, swimming pool, and premium amenities
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-stone-700 mr-2 text-lg">•</span>
                  <span className="text-stone-700">
                    RERA-approved with transparent pricing
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-stone-700 mr-2 text-lg">•</span>
                  <span className="text-stone-700">
                    {property.status} status, ready for occupancy
                  </span>
                </li>
              </ul>
            </div>
            <div className="h-96 w-full">
              <img
                src={
                  images.length > 1
                    ? images[1].src
                    : images.length > 0
                    ? images[0].src
                    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                }
                alt={property.name}
                className="w-full h-full rounded-lg shadow-md object-center"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  console.error("Failed to load overview image:", e.currentTarget.src);
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=400&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        className="py-8 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-stone-700 mb-4 text-center">
            World-Class Amenities
          </h2>
          <p className="text-base text-stone-600 mb-6 text-center max-w-xl mx-auto">
            Explore the premium facilities at {property.name}
          </p>
          {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-5 justify-items-center max-w-4xl mx-auto">
              {property.amenities.map((amenity: string, index: number) => (
                <div
                  key={index}
                  className="bg-stone-100 p-2 rounded-lg shadow-lg border border-gray-100 flex flex-col items-center gap-1 w-full transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:bg-stone-200"
                  style={{ maxWidth: "120px" }}
                >
                  <div className="w-12 h-15 flex items-center justify-center flex-shrink-0 mb-1">
                    <img
                      src={
                        amenityImages[amenity] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=48&h=48"
                      }
                      alt={`${amenity} icon`}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-stone-700 text-sm text-center truncate w-full">
                    {amenity}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-500 text-base py-4">
              No amenities available for this property.
            </p>
          )}
        </div>
      </motion.section>
      <motion.section
        className="py-12 bg-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-700 mb-2 text-center">
            Image Gallery
          </h2>
          <p className="text-base md:text-lg text-stone-600 mb-4 text-center max-w-xl mx-auto">
            Explore more visuals of {property.name}
          </p>
          {images.length > 0 ? (
            <div className="relative flex flex-col md:flex-row items-center justify-center">
              {images.length > 1 && (
                <div className="hidden md:block absolute left-0 w-1/3 h-[30rem] opacity-50 scale-90 transition-all duration-500">
                  <img
                    src={
                      images[(currentIndex - 1 + images.length) % images.length].src
                    }
                    alt="Previous"
                    className="w-full h-full object-cover rounded-lg shadow"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=300&q=80";
                    }}
                  />
                </div>
              )}
              <div className="w-full sm:w-[90%] md:w-[90vh] h-[20rem] sm:h-[25rem] md:h-[30rem] rounded-lg overflow-hidden shadow-md border border-stone-200 z-10">
                <img
                  src={images[currentIndex].src}
                  alt={images[currentIndex].alt}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=300&q=80";
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="hidden md:block absolute right-0 w-1/3 h-[30rem] opacity-50 scale-90 transition-all duration-500">
                  <img
                    src={images[(currentIndex + 1) % images.length].src}
                    alt="Next"
                    className="w-full h-full object-cover rounded-lg shadow"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=300&q=80";
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-[20rem] sm:h-[24rem] rounded-lg shadow-md border border-stone-200 bg-stone-50 flex items-center justify-center">
              <p className="text-center text-stone-500 text-base sm:text-lg py-4 max-w-md mx-auto">
                No additional images available for this property. Please check
                back later or contact support.
              </p>
            </div>
          )}
          <div className="text-center mb-4">
            {images.length > 0 ? (
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                {images.map((_: Image, index: number) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-stone-700"
                        : "border-2 border-stone-700 bg-transparent"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-2 mt-2">
                <span className="w-3 h-3 rounded-full bg-stone-300 cursor-not-allowed" />
              </div>
            )}
          </div>
        </div>
      </motion.section>
      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">
            Floor Plans
          </h2>
          <p className="text-lg text-stone-600 mb-6 text-center max-w-xl mx-auto">
            Explore the detailed layouts of {property.name}
          </p>
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {(["unit-plans", "site-plan", "tower-layout"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-stone-700 text-white"
                      : "bg-white text-stone-700 border border-stone-300 hover:bg-stone-50"
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab === "unit-plans" && "Unit Plans"}
                  {tab === "site-plan" && "Site Plan"}
                  {tab === "tower-layout" && "Tower Layout"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <div
                    className="w-full h-full object-cover overflow-auto rounded-lg shadow-md border border-stone-200"
                    style={{ minHeight: "34rem", maxHeight: "34rem" }}
                  >
                    <div
                      className="w-full h-full flex"
                      style={{
                        transformOrigin: "0 0",
                        transform: `scale(${zoomLevel})`,
                        transition: "transform 0.3s",
                      }}
                    >
                      <img
                        src={
                          activePlan ||
                          "https://via.placeholder.com/800x600?text=No+Plan+Available"
                        }
                        alt={`${property.name} ${activeTab} Floor Plan`}
                        className="w-full h-full object-contain"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/800x600?text=No+Plan+Available";
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={() =>
                        setZoomLevel((prev) => Math.min(prev + 0.1, 2))
                      }
                      className="bg-transparent rounded-full w-10 h-10 focus:outline-none"
                    >
                      <span className="text-4xl transition-colors duration-300">+</span>
                    </button>
                    <button
                      onClick={() =>
                        setZoomLevel((prev) => Math.max(prev - 0.1, 1))
                      }
                      className="bg-transparent rounded-full w-10 h-10 focus:outline-none"
                    >
                      <span className="text-4xl transition-colors duration-300">-</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-stone-800 mb-6">
                  Available Plans
                </h3>
                <div className="space-y-4 mb-8">
                  {activeTab === "unit-plans" && (
                    <>
                      {floorPlans
                        .filter((plan) => plan.type === "residential")
                        .map((plan: FloorPlan) => (
                          <div
                            key={plan.id}
                            className={`plan-item flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                              activePlan === plan.image
                                ? "bg-stone-50 border-2 border-stone-700"
                                : "hover:bg-stone-50"
                            }`}
                            onClick={() => setActivePlan(plan.image)}
                          >
                            <img
                              src={plan.thumbnail || "https://via.placeholder.com/64x64?text=No+Thumbnail"}
                              alt={plan.bhk}
                              className="w-16 h-16 rounded-lg object-cover object-top"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/64x64?text=No+Thumbnail";
                              }}
                            />
                            <div>
                              <h4 className="font-medium text-stone-800">{plan.bhk}</h4>
                              <p className="text-sm text-stone-600">{plan.size}</p>
                            </div>
                          </div>
                        ))}
                      {floorPlans
                        .filter((plan) => plan.type === "commercial")
                        .map((plan: FloorPlan) => (
                          <div
                            key={plan.id}
                            className={`plan-item flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                              activePlan === plan.image
                                ? "bg-stone-50 border-2 border-stone-700"
                                : "hover:bg-stone-50"
                            }`}
                            onClick={() => setActivePlan(plan.image)}
                          >
                            <img
                              src={plan.thumbnail || "https://via.placeholder.com/64x64?text=No+Thumbnail"}
                              alt={plan.bhk}
                              className="w-16 h-16 rounded-lg object-cover object-top"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/64x64?text=No+Thumbnail";
                              }}
                            />
                            <div>
                              <h4 className="font-medium text-stone-800">{plan.bhk}</h4>
                              <p className="text-sm text-stone-600">{plan.size}</p>
                            </div>
                          </div>
                        ))}
                      {floorPlans.length === 0 && (
                        <p className="text-stone-600 text-center">No unit plans available.</p>
                      )}
                    </>
                  )}
                  {activeTab !== "unit-plans" && (
                    <p className="text-stone-600 text-center">
                      Select Unit Plans to view uploaded plans.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">
            About the Developer
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-building-line text-black text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-700">
                      {property.developer_name}
                    </h3>
                    <p className="text-stone-600">
                      {property.developer_tagline || "Building Quality Homes"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-stone-700">
                      {property.developer_experience || 0}+
                    </div>
                    <div className="text-sm text-stone-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-stone-700">
                      {property.developer_projects_completed || 0}+
                    </div>
                    <div className="text-sm text-stone-600">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-stone-700">
                      {(property.developer_happy_families || 0).toLocaleString("en-IN")}+
                    </div>
                    <div className="text-sm text-stone-600">Happy Families</div>
                  </div>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {property.developer_name} has been a trusted name in real
                  estate for over {property.developer_experience || 0} years.
                  With a commitment to quality construction, timely delivery,
                  and customer satisfaction, we have successfully delivered
                  premium residential and commercial projects.
                </p>
              </div>
              <div>
                <img
                  src={
                    images.length > 2
                      ? images[2].src
                      : images.length > 0
                      ? images[0].src
                      : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
                  }
                  alt={property.name || "Property"}
                  className="w-full h-80 rounded"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error("Failed to load developer image:", e.currentTarget.src);
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=300&q=80";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        className="py-12 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">
            Prime Location
          </h2>
          <p className="text-lg text-stone-600 mb-6 text-center">
            Strategically located in {property.location} with excellent
            connectivity
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-stone-50 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-bold text-stone-700 mb-4">
                  Nearby Landmarks
                </h3>
                <div className="space-y-3">
                  {property.nearby_landmarks.length > 0 ? (
                    property.nearby_landmarks.map((landmark: { name: string; distance: string }, index: number) => (
                      <div key={index} className="flex items-center">
                        <i className="ri-map-pin-line text-stone-700 mr-2"></i>
                        <span className="text-stone-700">
                          {landmark.name} ({landmark.distance})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-600">No nearby landmarks available.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-1 rounded bg-stone-50 shadow-lg">
              <h3 className="text-xl font-bold mb-2 flex justify-center text-stone-700">
                Location on Map
              </h3>
              <iframe
                title="Google Map"
                className="shadow-lg"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  property.location
                )}&output=embed`}
              />
            </div>
          </div>
        </div>
      </motion.section>
      <EMICalculator property={property} />
      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <img
                  src={property.agents_image || "https://via.placeholder.com/80?text=Agent"}
                  alt={property.agent_name || "Agent"}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover object-center"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src = "https://via.placeholder.com/80?text=Agent";
                  }}
                />
                <h3 className="text-lg font-bold text-stone-700">
                  {property.agent_name || "N/A"}
                </h3>
                <p className="text-stone-600 text-sm">{property.agent_role || "N/A"}</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex text-yellow-500">
                    {property.agent_rating ? (
                      <>
                        {Array(Math.round(property.agent_rating))
                          .fill(0)
                          .map((_, i) => (
                            <i key={i} className="ri-star-fill text-sm"></i>
                          ))}
                        {Array(5 - Math.round(property.agent_rating))
                          .fill(0)
                          .map((_, i) => (
                            <i key={i} className="ri-star-line text-sm"></i>
                          ))}
                      </>
                    ) : (
                      <span className="text-stone-600 text-sm">No rating</span>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-stone-600">
                    {property.agent_rating || 0} ({property.agent_reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <i className="ri-phone-line text-stone-700 mr-2"></i>
                  <span className="text-stone-700">{property.agent_phone || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-mail-line text-stone-700 mr-2"></i>
                  <span className="text-stone-700">{property.agent_email || "N/A"}</span>
                </div>
                {property.agent_availability && (
                  <div className="flex items-center">
                    <i className="ri-time-line text-stone-700 mr-2"></i>
                    <span className="text-stone-700">
                      Available: {property.agent_availability}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  className="relative inline-block py-2 px-4 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors"
                >
                  <i className="ri-phone-line mr-2"></i>
                  Call Now
                </button>
                <button
                  className="relative inline-block py-2 px-4 rounded-lg font-semibold text-stone-600 border border-stone-600 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors"
                >
                  <i className="ri-message-line mr-2"></i>
                  Message
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-stone-700 mb-4">
                Book a Free Site Visit
              </h3>
              <p className="text-stone-600 mb-4">
                Experience {property.name} in person. Schedule your visit today!
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
                />
                <textarea
                  placeholder="Special Requirements (Optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
                ></textarea>
                <button
                  className="relative inline-block w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors"
                >
                  Book Site Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <CustomerReviews propertyId={id || ""} />
      </motion.section>
    </div>
  );
};

export default Details;