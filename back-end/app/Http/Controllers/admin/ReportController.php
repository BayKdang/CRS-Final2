<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ReportController extends Controller
{
    /**
     * Generate reports based on different criteria
     */
    public function index(Request $request)
    {
        try {
            $reportType = $request->input('report_type', 'revenue');
            $startDate = Carbon::parse($request->input('start_date'));
            $endDate = Carbon::parse($request->input('end_date'));
            
            // Ensure end date is not in the future
            $endDate = $endDate->isAfter(Carbon::now()) ? Carbon::now() : $endDate;
            
            switch($reportType) {
                case 'revenue':
                    return $this->generateRevenueReport($startDate, $endDate);
                case 'bookings':
                    return $this->generateBookingsReport($startDate, $endDate);
                case 'car_utilization':
                    return $this->generateCarUtilizationReport($startDate, $endDate);
                default:
                    return response()->json(['error' => 'Invalid report type'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Report generation error: ' . $e->getMessage());
            return response()->json(['error' => 'Error generating report: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Generate revenue report
     */
    private function generateRevenueReport($startDate, $endDate)
    {
        try {
            // Determine the appropriate grouping based on date range
            $diffInDays = $endDate->diffInDays($startDate);
            
            if ($diffInDays <= 31) {
                // Daily grouping for ranges <= 31 days
                $groupBy = 'day';
                $format = 'Y-m-d';
                $displayFormat = 'M d, Y';
            } elseif ($diffInDays <= 365) {
                // Weekly grouping for ranges <= 365 days
                $groupBy = 'week';
                $format = 'Y-W';
                $displayFormat = 'Week W, Y';
            } else {
                // Monthly grouping for ranges > 365 days
                $groupBy = 'month';
                $format = 'Y-m';
                $displayFormat = 'M Y';
            }
            
            // Get all bookings to ensure we have data
            $allBookings = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();
                
            // Create a default response if there's no data
            if ($allBookings->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'summary' => [
                        'total_revenue' => 0,
                        'total_bookings' => 0,
                        'avg_booking_value' => 0
                    ]
                ]);
            }
            
            // Check if total_price column exists
            if (!Schema::hasColumn('bookings', 'total_price')) {
                // Fallback to price or another column that might exist
                $priceColumn = Schema::hasColumn('bookings', 'price') ? 'price' : 'amount';
            } else {
                $priceColumn = 'total_price';
            }

            // Get revenue data grouped by the selected interval
            $revenueData = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw("DATE_FORMAT(created_at, '{$format}') as period_raw"),
                    DB::raw("SUM({$priceColumn}) as revenue")
                )
                ->groupBy('period_raw')
                ->orderBy('period_raw')
                ->get();
                
            // Format the data for display
            $formattedData = $revenueData->map(function ($item) use ($groupBy, $displayFormat) {
                try {
                    $periodDate = Carbon::parse($item->period_raw);
                    
                    if ($groupBy === 'week') {
                        // Format week-based periods specially
                        $weekYear = explode('-', $item->period_raw);
                        if (count($weekYear) >= 2) {
                            $year = $weekYear[0];
                            $week = $weekYear[1];
                            $period = str_replace(['W', 'Y'], [$week, $year], $displayFormat);
                        } else {
                            // Fallback if parsing fails
                            $period = $item->period_raw;
                        }
                    } else {
                        $period = $periodDate->format($displayFormat);
                    }
                } catch (\Exception $e) {
                    // Fallback if date parsing fails
                    $period = $item->period_raw ?? 'Unknown period';
                }
                
                return [
                    'period' => $period,
                    'revenue' => (float) $item->revenue
                ];
            });
            
            // Get summary statistics
            $totalRevenue = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum($priceColumn);
                
            $totalBookings = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
                
            $avgBookingValue = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
            
            return response()->json([
                'data' => $formattedData,
                'summary' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_bookings' => $totalBookings,
                    'avg_booking_value' => (float) $avgBookingValue
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Revenue report error: ' . $e->getMessage());
            return response()->json(['error' => 'Error generating revenue report: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Generate bookings report
     */
    private function generateBookingsReport($startDate, $endDate)
    {
        try {
            // Determine the appropriate grouping based on date range
            $diffInDays = $endDate->diffInDays($startDate);
            
            if ($diffInDays <= 31) {
                // Daily grouping for ranges <= 31 days
                $groupBy = 'day';
                $format = 'Y-m-d';
                $displayFormat = 'M d, Y';
            } elseif ($diffInDays <= 365) {
                // Weekly grouping for ranges <= 365 days
                $groupBy = 'week';
                $format = 'Y-W';
                $displayFormat = 'Week W, Y';
            } else {
                // Monthly grouping for ranges > 365 days
                $groupBy = 'month';
                $format = 'Y-m';
                $displayFormat = 'M Y';
            }
            
            // Check if total_price column exists
            if (!Schema::hasColumn('bookings', 'total_price')) {
                // Fallback to price or another column that might exist
                $priceColumn = Schema::hasColumn('bookings', 'price') ? 'price' : 'amount';
            } else {
                $priceColumn = 'total_price';
            }
            
            // Get booking data grouped by the selected interval
            $bookingsData = Booking::whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw("DATE_FORMAT(created_at, '{$format}') as period_raw"),
                    DB::raw("COUNT(*) as bookings_count"),
                    DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count"),
                    DB::raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count"),
                    DB::raw("SUM({$priceColumn}) as revenue")
                )
                ->groupBy('period_raw')
                ->orderBy('period_raw')
                ->get();
                
            // Format the data for display
            $formattedData = $bookingsData->map(function ($item) use ($groupBy, $displayFormat) {
                try {
                    $periodDate = Carbon::parse($item->period_raw);
                    
                    if ($groupBy === 'week') {
                        // Format week-based periods specially
                        $weekYear = explode('-', $item->period_raw);
                        if (count($weekYear) >= 2) {
                            $year = $weekYear[0];
                            $week = $weekYear[1];
                            $period = str_replace(['W', 'Y'], [$week, $year], $displayFormat);
                        } else {
                            // Fallback if parsing fails
                            $period = $item->period_raw;
                        }
                    } else {
                        $period = $periodDate->format($displayFormat);
                    }
                } catch (\Exception $e) {
                    // Fallback if date parsing fails
                    $period = $item->period_raw ?? 'Unknown period';
                }
                
                return [
                    'period' => $period,
                    'bookings_count' => (int) $item->bookings_count,
                    'completed_count' => (int) $item->completed_count,
                    'cancelled_count' => (int) $item->cancelled_count,
                    'revenue' => (float) $item->revenue
                ];
            });
            
            // Get summary statistics
            $totalBookings = Booking::whereBetween('created_at', [$startDate, $endDate])->count();
            $totalRevenue = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum($priceColumn);
            $completedBookings = Booking::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            $cancelledBookings = Booking::where('status', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            $avgBookingValue = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
            
            return response()->json([
                'data' => $formattedData,
                'summary' => [
                    'total_bookings' => $totalBookings,
                    'completed_bookings' => $completedBookings,
                    'cancelled_bookings' => $cancelledBookings,
                    'total_revenue' => (float) $totalRevenue,
                    'avg_booking_value' => (float) $avgBookingValue
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Bookings report error: ' . $e->getMessage());
            return response()->json(['error' => 'Error generating bookings report: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Generate car utilization report
     */
    private function generateCarUtilizationReport($startDate, $endDate)
    {
        try {
            // Get all cars
            $cars = Car::all();
            
            // If there are no cars, return empty data
            if ($cars->isEmpty()) {
                return response()->json([
                    'car_utilization' => [],
                    'summary' => [
                        'total_bookings' => 0,
                        'total_revenue' => 0,
                        'total_cars' => 0,
                        'avg_booking_value' => 0
                    ]
                ]);
            }
            
            // Check if total_price column exists
            if (!Schema::hasColumn('bookings', 'total_price')) {
                // Fallback to price or another column that might exist
                $priceColumn = Schema::hasColumn('bookings', 'price') ? 'price' : 'amount';
            } else {
                $priceColumn = 'total_price';
            }
            
            // Calculate days in the selected period
            $totalDays = $startDate->diffInDays($endDate) + 1;
            
            $utilizationData = [];
            
            foreach ($cars as $car) {
                // Count days the car was booked
                $bookedDays = 0;
                
                // Get all bookings for this car in the date range
                $bookings = Booking::where('car_id', $car->id)
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('start_date', '<', $startDate)
                                  ->where('end_date', '>', $endDate);
                            });
                    })
                    ->get();
                    
                // Count unique booked days
                $bookedDatesArray = [];
                
                foreach ($bookings as $booking) {
                    try {
                        $bookingStart = Carbon::parse($booking->start_date);
                        $bookingEnd = Carbon::parse($booking->end_date);
                        
                        // Adjust boundaries to be within our report range
                        $effectiveStart = $bookingStart->lt($startDate) ? $startDate : $bookingStart;
                        $effectiveEnd = $bookingEnd->gt($endDate) ? $endDate : $bookingEnd;
                        
                        // Add all dates in this booking to our array
                        $period = CarbonPeriod::create($effectiveStart, $effectiveEnd);
                        foreach ($period as $date) {
                            $bookedDatesArray[$date->format('Y-m-d')] = true;
                        }
                    } catch (\Exception $e) {
                        // Skip this booking if there's an issue with date parsing
                        Log::warning('Car utilization report - booking date parse error: ' . $e->getMessage());
                        continue;
                    }
                }
                
                $bookedDays = count($bookedDatesArray);
                $utilizationRate = ($totalDays > 0) ? ($bookedDays / $totalDays) * 100 : 0;
                
                // Get car name - adjust this based on your actual Car model fields
                $carName = $car->model ?? $car->name ?? "Car ID: {$car->id}";
                
                $utilizationData[] = [
                    'car_id' => $car->id,
                    'car_name' => $carName,
                    'bookings_count' => count($bookings),
                    'days_booked' => $bookedDays,
                    'total_days' => $totalDays,
                    'utilization_rate' => $utilizationRate
                ];
            }
            
            // Sort by utilization rate descending
            usort($utilizationData, function ($a, $b) {
                return $b['utilization_rate'] <=> $a['utilization_rate'];
            });
            
            // Get summary statistics
            $totalBookings = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            $totalRevenue = Booking::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum($priceColumn);
            
            return response()->json([
                'car_utilization' => $utilizationData,
                'summary' => [
                    'total_bookings' => $totalBookings,
                    'total_revenue' => (float) $totalRevenue,
                    'total_cars' => count($cars),
                    'avg_booking_value' => $totalBookings > 0 ? $totalRevenue / $totalBookings : 0
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Car utilization report error: ' . $e->getMessage());
            return response()->json(['error' => 'Error generating car utilization report: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Export report data as CSV
     */
    public function export(Request $request)
    {
        try {
            $reportType = $request->input('report_type', 'revenue');
            $startDate = Carbon::parse($request->input('start_date'));
            $endDate = Carbon::parse($request->input('end_date'));
            
            // Get report data based on type
            $reportData = null;
            
            switch($reportType) {
                case 'revenue':
                    $reportData = $this->generateRevenueReport($startDate, $endDate)->original;
                    break;
                case 'bookings':
                    $reportData = $this->generateBookingsReport($startDate, $endDate)->original;
                    break;
                case 'car_utilization':
                    $reportData = $this->generateCarUtilizationReport($startDate, $endDate)->original;
                    break;
                default:
                    return response()->json(['error' => 'Invalid report type'], 400);
            }
            
            return $this->exportToCsv($reportData, $reportType);
            
        } catch (\Exception $e) {
            Log::error('Report export error: ' . $e->getMessage());
            return response()->json(['error' => 'Error exporting report: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Export report data to CSV
     */
    private function exportToCsv($reportData, $reportType)
    {
        // Create a temporary file
        $filename = "report_{$reportType}_" . date('YmdHis') . ".csv";
        $handle = fopen('php://temp', 'w+');
        
        // Add headers based on report type
        if ($reportType === 'revenue') {
            fputcsv($handle, ['Period', 'Revenue']);
            if (isset($reportData['data'])) {
                foreach ($reportData['data'] as $row) {
                    fputcsv($handle, [$row['period'], $row['revenue']]);
                }
            }
        } else if ($reportType === 'bookings') {
            fputcsv($handle, ['Period', 'Bookings Count', 'Completed', 'Cancelled', 'Revenue']);
            if (isset($reportData['data'])) {
                foreach ($reportData['data'] as $row) {
                    fputcsv($handle, [
                        $row['period'], 
                        $row['bookings_count'], 
                        $row['completed_count'], 
                        $row['cancelled_count'],
                        $row['revenue']
                    ]);
                }
            }
        } else if ($reportType === 'car_utilization') {
            fputcsv($handle, ['Car', 'Total Bookings', 'Days Booked', 'Total Days', 'Utilization Rate (%)']);
            if (isset($reportData['car_utilization'])) {
                foreach ($reportData['car_utilization'] as $row) {
                    fputcsv($handle, [
                        $row['car_name'], 
                        $row['bookings_count'], 
                        $row['days_booked'],
                        $row['total_days'],
                        $row['utilization_rate']
                    ]);
                }
            }
        }
        
        // Add summary section
        fputcsv($handle, []); // Empty row as separator
        fputcsv($handle, ['Summary']);
        
        if (isset($reportData['summary'])) {
            foreach ($reportData['summary'] as $key => $value) {
                $label = str_replace('_', ' ', ucfirst($key));
                fputcsv($handle, [$label, $value]);
            }
        }
        
        // Reset the file pointer
        rewind($handle);
        
        // Read the content of the temporary file
        $content = stream_get_contents($handle);
        fclose($handle);
        
        // Return CSV response
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }
}