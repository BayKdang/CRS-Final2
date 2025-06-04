<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Add any other seeders you have
            // UserSeeder::class,
            // BrandSeeder::class,
            // CategorySeeder::class,
            CarSeeder::class,
        ]);
    }
}
