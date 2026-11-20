<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NutrilifeApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_user_can_login_with_nik_and_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'nikOrEmail' => 'GM001',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'token',
            'user' => ['id', 'nik', 'name', 'email', 'role', 'division'],
        ]);
        $response->assertJsonPath('user.role', 'GM');
    }

    public function test_user_can_login_with_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'nikOrEmail' => 'hr@nutrilife.com',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('user.role', 'HR');
    }

    public function test_get_shifts_and_offices_returns_seeded_data(): void
    {
        $shiftRes = $this->getJson('/api/master/shifts');
        $shiftRes->assertStatus(200);
        $shiftRes->assertJsonCount(3, 'shifts');

        $officeRes = $this->getJson('/api/master/offices');
        $officeRes->assertStatus(200);
        $officeRes->assertJsonCount(1, 'offices');
    }

    public function test_leaves_pending_endpoint_works(): void
    {
        $res = $this->getJson('/api/leaves/pending');
        $res->assertStatus(200);
        $res->assertJsonStructure(['pendingLeaves', 'total']);
    }
}
