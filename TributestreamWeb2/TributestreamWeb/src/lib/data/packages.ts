import type { PackageDetails } from '../stores/types';

export const packages: PackageDetails[] = [
    {
        name: "Tributestream Solo",
        price: 550,
        type: "Offline Recording",
        features: [
            "Professional Videographer",
            "2 Hours of Record Time",
            "Custom URL",
            "1 Year of Complimentary Hosting",
            "Complimentary Download of Recording"
        ]
    },
    {
        name: "Tributestream Gold",
        price: 1100,
        type: "Livestream Recording",
        features: [
            "Professional Livestream Technician",
            "Remote Livestream Producer",
            "Professional Videographer",
            "2 Hours of Broadcast Time",
            "Custom URL",
            "1 Year of Complimentary Hosting",
            "Complimentary Download of Livestream"
        ]
    },
    {
        name: "Tributestream Legacy",
        price: 2799,
        type: "Livestream Production",
        features: [
            "B-Roll Videographer",
            "Pre-Site Visit by Production Manager",
            "Post Production Editing",
            "Professional Livestream Technician",
            "Remote Livestream Producer",
            "Professional Videographer",
            "2 Hours of Broadcast Time",
            "Custom URL",
            "1 Year of Complimentary Hosting",
            "Complimentary Download of Livestream"
        ]
    }
];
