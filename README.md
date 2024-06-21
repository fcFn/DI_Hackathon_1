# Event Countdown

## What it is
Event Countdown is a configurable timer application designed to help users keep track of the time remaining until a specified event. It solves the problem of managing and sharing countdowns for important dates, such as birthdays, anniversaries, or project deadlines. The application allows users to create a countdown timer that can be shared via a URL, ensuring that others will see the same timer and event name. If you share your location with the app, it will try to determine national holidays for your country of location. However, that requires configuring API access via environment variables (see below).

## Features
- **Configurable Timer**: Set a countdown to any event with a specific date and time.
- **Shareable URL**: Generate a unique URL for each countdown, allowing you to share it with others.
- **Responsive Design**: The application is designed to work seamlessly on both desktop and mobile devices.
- **Real-time Updates**: The countdown timer updates in real-time, ensuring accurate time tracking.

## How to Run It

### Development
To run Event Countdown for development purposes, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/fcFn/DI_Hackathon_1.git
    cd DI_Hackathon_1
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

### Deployment
To deploy Event Countdown, you need to build the project and serve the generated files with a web server:

1. Build the project:
    ```bash
    npm run build
    ```

2. Serve the generated files:
    - Use a web server to serve the contents of the `dist` directory. Most web servers are configured to automatically serve the `index.html` file by default.

### Environment Variables
To enable the feature that determines national holidays based on your location, you need to configure two environment variables: `OPENCAGE_APIKEY` and `CALENDARIFIC_APIKEY`. These API keys are used to access external services:

1. **OPENCAGE_APIKEY**: This key is used to access the OpenCage Geocoding API, which converts geographic coordinates (latitude and longitude) into a country name (reverse geocoding). It's then used to get a list of national holidays in your country.

2. **CALENDARIFIC_APIKEY**: This key is used to access the Calendarific API, which provides information about national holidays for a given country. This allows the application to display relevant holidays based on your location.

To set these environment variables, create a `.env` file in the root directory of your project and add the following lines:
    ```
    OPENCAGE_APIKEY=your_opencage_apikey
    CALENDARIFIC_APIKEY=your_calendarific_apikey
    ```

Replace `your_opencage_apikey` and `your_calendarific_apikey` with your actual API keys.

Now you can share the URL of your deployed application with others, and they will see the same countdown timer and event name.
