declare namespace google {
  namespace maps {
    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (
            result: PlaceResult | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting?: {
          main_text: string;
          secondary_text: string;
        };
      }

      interface AutocompletionRequest {
        input: string;
        componentRestrictions?: {
          country: string | string[];
        };
        types?: string[];
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }

      interface PlaceResult {
        geometry?: {
          location?: {
            lat(): number;
            lng(): number;
          };
        };
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        NOT_FOUND = 'NOT_FOUND'
      }
    }
  }
} 