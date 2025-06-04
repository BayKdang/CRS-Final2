<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Car;
use App\Models\Brand;
use App\Models\Category;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Make sure we have at least one brand and one category
        $brands = Brand::all();
        if ($brands->isEmpty()) {
            // Create default brands if none exist
            Brand::create(['name' => 'Toyota', 'status' => 1]);
            Brand::create(['name' => 'Honda', 'status' => 1]);
            Brand::create(['name' => 'BMW', 'status' => 1]);
            Brand::create(['name' => 'Mercedes-Benz', 'status' => 1]);
            Brand::create(['name' => 'Ford', 'status' => 1]);
            $brands = Brand::all();
        }
        
        $categories = Category::all();
        if ($categories->isEmpty()) {
            // Create default categories if none exist
            Category::create(['name' => 'Sedan', 'status' => 1]);
            Category::create(['name' => 'SUV', 'status' => 1]);
            Category::create(['name' => 'Truck', 'status' => 1]);
            Category::create(['name' => 'Coupe', 'status' => 1]);
            Category::create(['name' => 'Hatchback', 'status' => 1]);
            $categories = Category::all();
        }
        
        // Single image path for all cars
        $imagePath = 'uploads/cars/default_car.jpg';
        
        // Sample car data
        $cars = [
            [
                'name' => 'Toyota Camry',
                'brand_id' => $brands->where('name', 'Toyota')->first()->id ?? $brands->first()->id,
                'category_id' => $categories->where('name', 'Sedan')->first()->id ?? $categories->first()->id,
                'year' => 2023,
                'price' => 32999.99,
                'status' => 'available',
                'description' => 'Reliable and comfortable sedan with excellent fuel efficiency.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'mileage' => '0 miles',
                'condition' => 'New',
                'featured' => true,
                'image' => $imagePath
            ],
            [
                'name' => 'Honda CR-V',
                'brand_id' => $brands->where('name', 'Honda')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'SUV')->first()->id ?? $categories->random()->id,
                'year' => 2023,
                'price' => 36500.00,
                'status' => 'available',
                'description' => 'Spacious SUV with advanced safety features and great handling.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'mileage' => '0 miles',
                'condition' => 'New',
                'featured' => true,
                'image' => $imagePath
            ],
            [
                'name' => 'BMW 5 Series',
                'brand_id' => $brands->where('name', 'BMW')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'Sedan')->first()->id ?? $categories->random()->id,
                'year' => 2023,
                'price' => 62500.00,
                'status' => 'available',
                'description' => 'Luxury sedan offering premium comfort and cutting-edge technology.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'mileage' => '15 miles',
                'condition' => 'New',
                'featured' => true,
                'image' => $imagePath
            ],
            [
                'name' => 'Ford F-150',
                'brand_id' => $brands->where('name', 'Ford')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'Truck')->first()->id ?? $categories->random()->id,
                'year' => 2022,
                'price' => 45999.00,
                'status' => 'available',
                'description' => 'Powerful and capable truck with excellent towing capacity.',
                'fuel_type' => 'Diesel',
                'transmission' => 'Automatic',
                'mileage' => '500 miles',
                'condition' => 'Used',
                'featured' => false,
                'image' => $imagePath
            ],
            [
                'name' => 'Mercedes-Benz E-Class',
                'brand_id' => $brands->where('name', 'Mercedes-Benz')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'Sedan')->first()->id ?? $categories->random()->id,
                'year' => 2023,
                'price' => 68900.00,
                'status' => 'available',
                'description' => 'Elegant luxury sedan with state-of-the-art features and smooth ride.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'mileage' => '0 miles',
                'condition' => 'New',
                'featured' => true,
                'image' => $imagePath
            ],
            [
                'name' => 'Honda Civic',
                'brand_id' => $brands->where('name', 'Honda')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'Sedan')->first()->id ?? $categories->random()->id,
                'year' => 2023,
                'price' => 25800.00,
                'status' => 'available',
                'description' => 'Compact sedan with excellent fuel economy and reliability.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Manual',
                'mileage' => '50 miles',
                'condition' => 'New',
                'featured' => false,
                'image' => $imagePath
            ],
            [
                'name' => 'Toyota RAV4',
                'brand_id' => $brands->where('name', 'Toyota')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'SUV')->first()->id ?? $categories->random()->id,
                'year' => 2023,
                'price' => 33500.00,
                'status' => 'available',
                'description' => 'Compact SUV with good fuel economy and plenty of cargo space.',
                'fuel_type' => 'Hybrid',
                'transmission' => 'Automatic',
                'mileage' => '0 miles',
                'condition' => 'New',
                'featured' => true,
                'image' => $imagePath
            ],
            [
                'name' => 'BMW X5',
                'brand_id' => $brands->where('name', 'BMW')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'SUV')->first()->id ?? $categories->random()->id,
                'year' => 2022,
                'price' => 72500.00,
                'status' => 'available',
                'description' => 'Luxury SUV with powerful performance and premium features.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'mileage' => '1000 miles',
                'condition' => 'Used',
                'featured' => false,
                'image' => $imagePath
            ],
            [
                'name' => 'Ford Mustang',
                'brand_id' => $brands->where('name', 'Ford')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'Coupe')->first()->id ?? $categories->random()->id,
                'year' => 2023,
                'price' => 54999.00,
                'status' => 'available',
                'description' => 'Iconic sports car with powerful engine and sleek design.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Manual',
                'mileage' => '0 miles',
                'condition' => 'New',
                'featured' => true,
                'image' => $imagePath
            ],
            [
                'name' => 'Toyota Corolla',
                'brand_id' => $brands->where('name', 'Toyota')->first()->id ?? $brands->random()->id,
                'category_id' => $categories->where('name', 'Sedan')->first()->id ?? $categories->random()->id,
                'year' => 2022,
                'price' => 22999.99,
                'status' => 'available',
                'description' => 'Economical and reliable compact sedan with good fuel efficiency.',
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'mileage' => '5000 miles',
                'condition' => 'Used',
                'featured' => false,
                'image' => $imagePath
            ],
        ];
        
        // Insert cars into database
        foreach ($cars as $carData) {
            Car::create($carData);
        }
    }
}
