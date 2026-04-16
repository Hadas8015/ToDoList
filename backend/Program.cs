using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;
using TodoApi;
using System.IdentityModel.Tokens.Jwt;

//rout+ JWT
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ToDoContext>();
builder.Services.AddDbContext<TodolistContext>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// הגדרות Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// הגדרת JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,          // לא בודקים מי הוציא את הטוקן
            ValidateAudience = false,        // לא בודקים למי הטוקן מיועד
            ValidateLifetime = true,         // בודקים שהטוקן לא פג תוקף
            ValidateIssuerSigningKey = true, // בודקים שהחתימה תקינה
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)) // המפתח הסודי מה-appsettings
        };
    });

builder.Services.AddAuthorization();
var app = builder.Build();
app.UseCors("AllowAll");

// הפעלת מנגנון האימות - בודק מי המשתמש
app.UseAuthentication();
// הפעלת מנגנון ההרשאות - בודק מה מותר למשתמש
app.UseAuthorization();
// הפעלת Swagger
app.UseSwagger();
app.UseSwaggerUI();

// שליפת כל המשימות - רק למשתמש מחובר
app.MapGet("/Items", async (ToDoContext db) =>
    await db.Items.ToListAsync()).RequireAuthorization();

// הוספת משימה חדשה - רק למשתמש מחובר
app.MapPost("/Items", async (ToDoContext db, Item item) =>
{
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/Items/{item.Id}", item);
}).RequireAuthorization();

// עדכון משימה לפי ID - רק למשתמש מחובר
app.MapPut("/items/{id}", async (ToDoContext db, int id, Item updatedItem) =>
{
    var item = await db.Items.FindAsync(id);
    if (item is null) return Results.NotFound();
    item.Name = updatedItem.Name;
    item.IsComplete = updatedItem.IsComplete;
    await db.SaveChangesAsync();
    return Results.Ok(item);
}).RequireAuthorization();

// מחיקת משימה לפי ID - רק למשתמש מחובר
app.MapDelete("/items/{id}", async (ToDoContext db, int id) =>
{
    var item = await db.Items.FindAsync(id);
    if (item is null) return Results.NotFound();
    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// הרשמת משתמש חדש - פתוח לכולם
app.MapPost("/register", async (TodolistContext db, User user) =>
{
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(user);
});

// התחברות משתמש קיים - מחזיר טוקן JWT אם הפרטים נכונים
app.MapPost("/login", async (TodolistContext db, User userLogin) =>
{
    // בדיקה שהמשתמש קיים עם הסיסמה הנכונה
    var user = await db.Users
        .FirstOrDefaultAsync(u => u.Username == userLogin.Username 
                               && u.Password == userLogin.Password);
    
    if (user is null) return Results.Unauthorized();

    // יצירת הטוקן עם המפתח הסודי
    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        claims: new[] { new Claim(ClaimTypes.Name, user.Username) }, // שמירת שם המשתמש בתוך הטוקן
        expires: DateTime.Now.AddHours(1), // תוקף של שעה אחת
        signingCredentials: creds);

    // החזרת הטוקן לקליינט
    return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
});

app.Run();