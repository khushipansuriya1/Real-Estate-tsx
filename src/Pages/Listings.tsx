import React, { useEffect, useState, useRef, useCallback, type ChangeEvent } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  FaMapMarkerAlt,
  FaMoneyBill,
  FaBuilding,
  FaHome,
  FaRulerCombined,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

// Define interfaces for data structures
interface Property {
  id: string;
  name: string;
  type: string;
  bhk: number;
  price: number;
  location: string;
  status: string;
  progress: number;
  image: string | null;
  developer: string;
  developer_logo: string;
  carpet_area: number;
  isInWishlist?: boolean;
}

interface Filters {
  location: string;
  price: string;
  area: string;
  property_type: string;
  status: string;
  sort: string;
  wishlistCriteria: boolean;
}

interface WishlistCriteria {
  location?: string;
  price?: string;
  area?: string;
  property_type?: string;
  status?: string;
}

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
  userRole: string | null;
  wishlistCriteria: WishlistCriteria;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Default image URL
const DEFAULT_IMAGE: string = "https://via.placeholder.com/300x300?text=No+Image";



const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  clearFilters,
  userRole,
  wishlistCriteria,
  isFilterOpen,
  setIsFilterOpen,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      localStorage.setItem("zivaasFilters", JSON.stringify(updatedFilters));
      return updatedFilters;
    });
  };

  const removeFilter = (filterName: keyof Filters) => {
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [filterName]: filterName === "wishlistCriteria" ? false : "",
      };
      localStorage.setItem("zivaasFilters", JSON.stringify(updatedFilters));
      return updatedFilters;
    });
  };

  const applyWishlistCriteria = () => {
    const savedFilters: Filters = {
      location: wishlistCriteria.location || "",
      price: wishlistCriteria.price || "",
      area: wishlistCriteria.area || "",
      property_type: wishlistCriteria.property_type || "",
      status: wishlistCriteria.status || "",
      sort: filters.sort || "",
      wishlistCriteria: true,
    };
    setFilters(savedFilters);
    localStorage.setItem("zivaasFilters", JSON.stringify(savedFilters));
    setFilters(savedFilters); // Apply filters immediately
    setIsFilterOpen(false); // Hide filter bar after applying
  };

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && key !== "sort"
  ) as [keyof Filters, string | boolean][];

  return (
    <motion.div
      className={`w-full bg-white p-6 rounded-lg shadow-lg border border-stone-200 z-20 ${
        isFilterOpen ? "block" : "hidden md:block"
      } md:w-64 md:sticky md:top-20 h-fit`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-300 pb-2">
        Filter Properties
      </h3>
      {userRole === "customer" && !filters.wishlistCriteria && (
        <button
          onClick={applyWishlistCriteria}
          className="w-full bg-stone-700 text-white py-2 rounded-md hover:bg-stone-600 transition duration-300 mb-4"
          aria-label="Apply saved criteria"
        >
          Apply Saved Criteria
        </button>
      )}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-stone-600 mb-2">
            Selected Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="bg-stone-100 text-stone-700 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1"
              >
                <span>
                  {key === "price"
                    ? value.toString().replace("-", " - ").replace("15000000+", "₹1.5cr+")
                    : key === "area"
                    ? `${value} sq.ft`
                    : key === "wishlistCriteria"
                    ? "Saved Criteria"
                    : value.toString()}
                </span>
                <button
                  onClick={() => removeFilter(key)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {!filters.wishlistCriteria && (
          <>
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-none focus:ring-stone-400 transition"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                <FaMoneyBill className="mr-2" /> Price Range
              </label>
              <select
                name="price"
                value={filters.price}
                onChange={handleChange}
                className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-none focus:ring-stone-400 transition"
              >
                <option value="">Any</option>
                <option value="0-5000000">0-₹50L</option>
                <option value="5000000-7000000">₹50L-₹70L</option>
                <option value="7000000-10000000">₹70L-₹1cr</option>
                <option value="10000000-15000000">₹1cr-₹1.5cr</option>
                <option value="15000000+">₹1.5cr+</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                <FaRulerCombined className="mr-2" /> Area (sq.ft)
              </label>
              <input
                type="text"
                name="area"
                value={filters.area}
                onChange={handleChange}
                placeholder="e.g., 1000 or 1500+"
                className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-none focus:ring-stone-400 transition"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                <FaBuilding className="mr-2" /> Property Type
              </label>
              <select
                name="property_type"
                value={filters.property_type}
                onChange={handleChange}
                className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-none focus:ring-stone-400 transition"
              >
                <option value="">Any</option>
                <option value="Flat">Flat</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                <FaHome className="mr-2" /> Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-none focus:ring-stone-400 transition"
              >
                <option value="">Any</option>
                <option value="Ready">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                Sort
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleChange}
                className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-none focus:ring-stone-400 transition"
              >
                <option value="">Sort</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
              </select>
            </div>
          </>
        )}
        <button
          onClick={clearFilters}
          className="relative w-full py-2 rounded-md font-medium text-white bg-stone-700 z-10 overflow-hidden mt-2
            before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
            before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
        >
          Clear Filters
        </button>
      </div>
    </motion.div>
  );
};

const Listings: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [allProps, setAllProps] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const perPage = 9;

  const [filters, setFilters] = useState<Filters>(() => {
    const stored = localStorage.getItem("zivaasFilters");
    return stored
      ? JSON.parse(stored)
      : {
          location: "",
          price: "",
          area: "",
          property_type: "",
          status: "",
          sort: "",
          wishlistCriteria: false,
        };
  });

  const [userRole, setUserRole] = useState<string | null>(null);
  const [wishlistCriteria, setWishlistCriteria] = useState<WishlistCriteria>({});
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, wishlist_criteria")
            .eq("id", user.id)
            .single();
          if (userError) {
            console.error("Listings: Error fetching user data:", userError);
            setError(`Error fetching user data: ${userError.message}`);
            setUserRole(null);
            setWishlistCriteria({});
            return;
          }
          setUserRole(userData.role);
          const criteria = userData.wishlist_criteria || {};
          console.log("Listings: Fetched wishlist_criteria:", criteria);
          if (typeof criteria === "string") {
            try {
              const parsedCriteria: WishlistCriteria = JSON.parse(criteria);
              setWishlistCriteria(parsedCriteria);
              console.log(
                "Listings: Parsed wishlist_criteria:",
                parsedCriteria
              );
            } catch (parseError: unknown) {
              console.error(
                "Listings: Failed to parse wishlist_criteria:",
                parseError
              );
              setWishlistCriteria({});
              setError(
                "Invalid saved criteria format. Please update your criteria."
              );
            }
          } else {
            setWishlistCriteria(criteria);
          }
        } else {
          setUserRole(null);
          setWishlistCriteria({});
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Listings: Error fetching user data:", errorMessage);
        setError(`Error fetching user data: ${errorMessage}`);
        setWishlistCriteria({});
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log("Listings: Fetching properties from Supabase");
        const { data: propertiesData, error: propertiesError } =
          await supabase.from("properties").select(`
            id, name, property_type, images, developer_id, price, location, status, configuration, carpet_area,
            users (
              id,
              username,
              email,
              role,
              developer_logo
            )
          `);

        if (propertiesError) {
          console.error("Listings: Supabase Error Details:", propertiesError);
          throw new Error(
            `Failed to fetch properties: ${propertiesError.message} (Code: ${propertiesError.code})`
          );
        }

        console.log("Listings: Raw properties data:", propertiesData);

        if (!propertiesData || propertiesData.length === 0) {
          console.warn("Listings: No properties data returned from Supabase");
          setAllProps([]);
          setError("No properties found in the database.");
          return;
        }

        const mappedProperties: Property[] = propertiesData.map((p) => {
          const typeValue = p.property_type
            ? p.property_type.charAt(0).toUpperCase() +
              p.property_type.slice(1).toLowerCase()
            : "Unknown";
          console.log(
            `Listings: Mapping property ${p.id}: property_type=${p.property_type}, mapped type=${typeValue}`
          );
          return {
            id: p.id,
            name: p.name || "Unnamed Property",
            type: typeValue,
            bhk: p.configuration ? parseInt(String(p.configuration).replace(/\D/g, '')) || 0 : 0,
            price: p.price ? parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0 : 0,
            location: p.location || "Unknown",
            status: p.status || "Unknown",
            progress: p.status === "Upcoming" ? 0 : p.status === "Under Construction" ? 0.5 : 1,
            image: p.images ? p.images.split(",")[0]?.trim() || null : null,
            developer: (() => {
              // Handle both array and object structures for users
              if (Array.isArray(p.users)) {
                return (p.users[0] as { username?: string })?.username || "Unknown Developer";
              } else if (p.users && typeof p.users === 'object') {
                return (p.users as { username?: string }).username || "Unknown Developer";
              } else {
                return "Unknown Developer";
              }
            })(),
            developer_logo: (() => {
              // Handle both array and object structures for users
              if (Array.isArray(p.users)) {
                const user = p.users[0] as { username?: string; email?: string; developer_logo?: string };
                return user?.developer_logo ||
                       (user?.username ? `https://via.placeholder.com/50?text=${encodeURIComponent(user.username)}` : null) ||
                       (user?.email ? `https://via.placeholder.com/50?text=${encodeURIComponent(user.email)}` : null) ||
                       "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/default%20logo.jpg";
              } else if (p.users && typeof p.users === 'object') {
                const user = p.users as { username?: string; email?: string; developer_logo?: string };
                return user?.developer_logo ||
                       (user?.username ? `https://via.placeholder.com/50?text=${encodeURIComponent(user.username)}` : null) ||
                       (user?.email ? `https://via.placeholder.com/50?text=${encodeURIComponent(user.email)}` : null) ||
                       "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/default%20logo.jpg";
              } else {
                return "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/default%20logo.jpg";
              }
            })(),
            carpet_area: p.carpet_area ? parseFloat(String(p.carpet_area)) || 0 : 0,
          };
        });

        console.log("Listings: Mapped properties:", mappedProperties);
        setAllProps(mappedProperties);
        setError(null);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Listings: Error fetching properties:", errorMessage);
        setError(
          `Error loading properties: ${errorMessage}. Check console for details.`
        );
        setAllProps([]);
      }
    };

    fetchProperties();
  }, [location]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.role === "developer" || userRole === "developer")
        return;

      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select("property_id")
        .eq("user_id", user.id);

      if (wishlistError) {
        console.error("Listings: Error fetching wishlist:", wishlistError);
        setError(`Error fetching wishlist: ${wishlistError.message}`);
        return;
      }

      const wishlistIds = wishlistData.map((item: { property_id: string }) => item.property_id);

      setAllProps((prev) =>
        prev.map((prop) => ({
          ...prop,
          isInWishlist: wishlistIds.includes(prop.id),
        }))
      );
    };

    fetchWishlistStatus();
  }, [allProps.length, userRole]);

  const applyFilters = useCallback((currentFilters: Filters) => {
    let result = [...allProps];

    if (
      currentFilters.wishlistCriteria &&
      wishlistCriteria &&
      Object.keys(wishlistCriteria).length > 0
    ) {
      console.log("Listings: Applying wishlistCriteria:", wishlistCriteria);
      if (wishlistCriteria.location) {
        result = result.filter((p) =>
          p.location
            ?.toLowerCase()
            .includes(wishlistCriteria.location!.toLowerCase().trim())
        );
      }
      if (wishlistCriteria.price) {
        result = result.filter((p) => {
          const price = parseFloat(String(p.price)) || 0;
          const [min, max] = wishlistCriteria.price!
            .split("-")
            .map((p) =>
              p === "+" ? Infinity : parseFloat(p.replace(/[^0-9]/g, "")) || 0
            );
          return min <= price && (max === Infinity ? true : price <= max);
        });
      }
      if (wishlistCriteria.area) {
        result = result.filter((p) => {
          const propArea = parseInt(String(p.carpet_area)) || 0;
          const critArea =
            parseInt(wishlistCriteria.area!.replace("+", "")) || 0;
          return wishlistCriteria.area!.includes("+")
            ? propArea >= critArea
            : propArea === critArea;
        });
      }
      if (wishlistCriteria.property_type) {
        result = result.filter(
          (p) =>
            p.type?.toLowerCase() ===
            wishlistCriteria.property_type!.toLowerCase()
        );
      }
      if (wishlistCriteria.status) {
        if (wishlistCriteria.status!.toLowerCase() === "upcoming") {
          result = result.filter((p) => p.progress === 0);
        } else {
          result = result.filter(
            (p) =>
              p.status?.toLowerCase() ===
                wishlistCriteria.status!.toLowerCase() && p.progress > 0
          );
        }
      }
    } else {
      if (searchQuery) {
        result = result.filter(
          (p) =>
            p.name?.toLowerCase().includes(searchQuery) ||
            p.developer?.toLowerCase().includes(searchQuery) ||
            p.location?.toLowerCase().includes(searchQuery)
        );
      }

      if (currentFilters.location) {
        console.log(
          "Listings: Filtering by location:",
          currentFilters.location
        );
        result = result.filter((p) =>
          p.location
            ?.toLowerCase()
            .includes(currentFilters.location.toLowerCase().trim())
        );
        console.log(
          "Listings: After location filter, result length:",
          result.length
        );
      }

      if (currentFilters.price) {
        result = result.filter((p) => {
          const price = parseFloat(String(p.price)) || 0;
          const [min, max] = currentFilters.price
            .split("-")
            .map((p) =>
              p === "+" ? Infinity : parseFloat(p.replace(/[^0-9]/g, "")) || 0
            );
          return min <= price && (max === Infinity ? true : price <= max);
        });
      }

      if (currentFilters.area) {
        result = result.filter((p) => {
          const propArea = parseInt(String(p.carpet_area)) || 0;
          const critArea = parseInt(currentFilters.area.replace("+", "")) || 0;
          return currentFilters.area.includes("+")
            ? propArea >= critArea
            : propArea === critArea;
        });
      }

      if (currentFilters.property_type) {
        result = result.filter(
          (p) =>
            p.type?.toLowerCase() === currentFilters.property_type.toLowerCase()
        );
      }

      if (currentFilters.status) {
        if (currentFilters.status.toLowerCase() === "upcoming") {
          result = result.filter((p) => p.progress === 0);
        } else {
          result = result.filter(
            (p) =>
              p.status?.toLowerCase() === currentFilters.status.toLowerCase() &&
              p.progress > 0
          );
        }
      }

      if (currentFilters.sort === "priceLowHigh") {
        result.sort((a, b) => a.price - b.price);
      } else if (currentFilters.sort === "priceHighLow") {
        result.sort((a, b) => b.price - a.price);
      }
    }

    console.log("Listings: Filtered properties:", result);
    setFilteredProperties(result);
    setPage(1); // Reset to first page when filters are applied
    if (currentFilters.wishlistCriteria && result.length === 0 && !error) {
      setError("No properties match your saved criteria.");
    } else if (result.length > 0) {
      setError(null);
    }
  }, [allProps, wishlistCriteria, searchQuery, error]);

  useEffect(() => {
    // Initial load with all properties, then apply initial filters
    setFilteredProperties(allProps);
    applyFilters(filters); // Apply initial filters from localStorage or default
  }, [allProps, filters, applyFilters]); // Re-run when allProps or filters change

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !visibleSections.includes(entry.target.id)
          ) {
            setVisibleSections((prev) => [...prev, entry.target.id]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [visibleSections]);

  const clearFilters = () => {
    const clearedFilters: Filters = {
      location: "",
      price: "",
      area: "",
      property_type: "",
      status: "",
      sort: "",
      wishlistCriteria: false,
    };
    setFilters(clearedFilters);
    localStorage.setItem("zivaasFilters", JSON.stringify(clearedFilters));
    applyFilters(clearedFilters); // Apply cleared filters
    setPage(1);
    setIsFilterOpen(false); // Hide filter bar after clearing
  };

  const isVisible = (id: string) => visibleSections.includes(id);

  const totalPages = Math.ceil(filteredProperties.length / perPage);
  const paginatedProperties = filteredProperties.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const toggleWishlist = async (propertyId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.role === "developer" || userRole === "developer") {
      setError("Developers cannot manage wishlist.");
      return;
    }

    try {
      const property = allProps.find((p) => p.id === propertyId);
      if (property?.isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);

        if (error)
          throw new Error(`Failed to remove from wishlist: ${error.message}`);

        setAllProps((prev) =>
          prev.map((prop) =>
            prop.id === propertyId ? { ...prop, isInWishlist: false } : prop
          )
        );
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: user.id, property_id: propertyId });

        if (error) {
          if (error.code === "23505") {
            setError("This property is already in your wishlist.");
          } else {
            throw new Error(`Failed to add to wishlist: ${error.message}`);
          }
        } else {
          setAllProps((prev) =>
            prev.map((prop) =>
              prop.id === propertyId ? { ...prop, isInWishlist: true } : prop
            )
          );
        }
      }
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Listings: Error toggling wishlist:", err);
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section
        id="section1"
        ref={(el) => { sectionRefs.current[0] = el as HTMLDivElement | null; }}
        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 transition-all duration-1000 transform ${
          isVisible("section1") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bglisting.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 px-4 max-w-6xl mx-auto">
          <h1
            className="text-3xl md:text-5xl font-bold mb-3 transition-opacity duration-600"
            style={{ opacity: isVisible("section1") ? 1 : 0, transform: isVisible("section1") ? "translateX(0)" : "translateX(-20px)" }}
          >
            Explore Properties
          </h1>
          <p
            className="text-2xl max-w-xl mx-auto transition-opacity duration-600"
            style={{ opacity: isVisible("section1") ? 1 : 0, transform: isVisible("section1") ? "translateX(0)" : "translateX(-20px)" }}
          >
            Discover a wide range of premium residential and commercial
            properties curated by Zivaas Properties.
          </p>
        </div>
      </section>

      <h2 className="text-4xl font-bold text-stone-700 mt-15 p-4 text-center">
        Available Properties
      </h2>
      <p className="text-base text-stone-600 text-center mb-8 px-4">
        Discover a selection of premium properties designed to suit every need
        and lifestyle.
      </p>

      {/* Properties Section */}
      <section
        id="section2"
        ref={(el) => { sectionRefs.current[1] = el as HTMLDivElement | null; }}
        className={`max-w-7xl mx-auto p-4 transition-all duration-1000 transform grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 ${
          isVisible("section2") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-30"
        }`}
      >
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden flex justify-end">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-stone-700 flex gap-2 text-white px-4 py-2 items-center rounded-full hover:bg-stone-600 transition duration-300"
            aria-label="Toggle filter"
          >
            <FaFilter size={22} />
            Filter
          </button>
        </div>
        {/* FilterBar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          userRole={userRole}
          wishlistCriteria={wishlistCriteria}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />

        <div>
          {/* Properties Grid on the right */}
          <div className="w-full">
            {error && (
              <p className="text-stone-600 text-center mb-4">{error}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedProperties.length > 0 ? (
                paginatedProperties.map((property: Property) => (
                  <div
                    key={property.id}
                    className="rounded shadow hover:shadow-lg transition text-white"
                  >
                    <div className="relative group h-[300px] w-full overflow-hidden rounded">
                      <Link to={`/listings/${property.id}`}>
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.name}
                            className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              e.currentTarget.src = DEFAULT_IMAGE;
                              e.currentTarget.parentElement!.classList.add(
                                "flex",
                                "items-center",
                                "justify-center",
                                "bg-gray-200"
                              );
                              console.error(
                                "Listings: Image load failed:",
                                property.image
                              );
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-stone-700">
                            Image not uploaded
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          <div className="absolute bottom-4 left-4 text-left">
                            <h3 className="text-lg font-semibold">
                              {property.name}
                            </h3>
                            <p className="text-sm">{property.location}</p>
                            <p className="text-sm">
                              {property.bhk ? `${property.bhk} BHK • ` : ""}₹
                              {property.price.toLocaleString()}
                            </p>
                            <p className="text-sm">
                              {property.type || "Unknown Type"} •{" "}
                              {property.status || "Unknown Status"}
                            </p>
                            <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Built by: {property.developer}
                            </p>
                            <div className="mt-1">
                              <Link
                                to={`/listings/${property.id}`}
                                className="underline text-white hover:font-semibold"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {userRole === "customer" &&
                        property.isInWishlist !== undefined && (
                          <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.preventDefault();
                              toggleWishlist(property.id);
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white hover:text-red-500"
                            aria-label={
                              property.isInWishlist
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                          >
                            <Heart
                              size={24}
                              fill={property.isInWishlist ? "white" : "none"}
                              stroke={property.isInWishlist ? "white" : "white"}
                            />
                          </button>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-stone-600 text-lg col-span-full">
                  {error || "No properties found in the database."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      {filteredProperties.length > perPage && (
        <div className="flex justify-center mb-6 mt-6 space-x-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:right-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <FaArrowLeft size={20} />
          </button>
          <span className="text-stone-700 mt-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Listings;