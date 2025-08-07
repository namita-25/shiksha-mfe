import { processImageUrl, getBestImageUrl } from "./imageUtils";

// Test processImageUrl function
console.log("Testing processImageUrl:");
console.log("Absolute URL:", processImageUrl("https://example.com/image.jpg")); // Should return as is
console.log(
  "Relative URL with base:",
  processImageUrl("/content/image.jpg", "https://api.example.com")
); // Should construct full URL
console.log("Empty URL:", processImageUrl("")); // Should return empty string
console.log("Undefined URL:", processImageUrl(undefined)); // Should return empty string

// Test getBestImageUrl function
console.log("\nTesting getBestImageUrl:");
const testItem = {
  posterImage: "/content/poster.jpg",
  appIcon: "/content/icon.png",
  name: "Test Course",
};

console.log(
  "With posterImage:",
  getBestImageUrl(testItem, "https://api.example.com")
);
console.log(
  "Without posterImage:",
  getBestImageUrl(
    { ...testItem, posterImage: undefined },
    "https://api.example.com"
  )
);
console.log(
  "Without any image:",
  getBestImageUrl({ name: "Test" }, "https://api.example.com")
);
console.log(
  "Empty item:",
  getBestImageUrl(undefined, "https://api.example.com")
);
