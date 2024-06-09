// Function to fetch country from coordinates using OpenCage API
const fetchCountryFromCoordinates = async (latitude, longitude) => {
  const apiKey = process.env.OPENCAGE_APIKEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length > 0) {
      const country = data.results[0].components.country_code;
      return country.toUpperCase(); // Returning the country code in uppercase
    } else {
      throw new Error("Country not found in the response.");
    }
  } catch (error) {
    console.error("Error fetching country:", error);
  }
};

// Function to fetch holidays from Calendarific using country code
const fetchHolidays = async (country, year) => {
  const apiKey = process.env.CALENDARIFIC_APIKEY;
  const url = `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=${country}&year=${year}&type=national`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.response.holidays;
  } catch (error) {
    console.error("Error fetching holidays:", error);
  }
};

// Function to get the user's current location, determine the country, and fetch holidays
const determineCountryAndFetchHolidays = async (year, callback) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const country = await fetchCountryFromCoordinates(
            latitude,
            longitude,
          );

          if (country) {
            // TODO: Probably better to run it sequentially since
            //   or otherwise check which year we got first
            const holidays = await Promise.all([
              fetchHolidays(country, year),
              fetchHolidays(country, year + 1),
            ]).catch((error) => {
              // I'm not sure this is needed
              throw error;
            });
            return callback(holidays);
          } else {
            throw new Error("Could not determine country.");
            console.error("Could not determine country.");
          }
        } catch (error) {
          console.error(
            "Error determining country or fetching holidays:",
            error,
          );
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
};

export { determineCountryAndFetchHolidays };
