# Maven Installation Guide for Windows

## Quick Option: Use IntelliJ IDEA (No Installation Needed!)

IntelliJ IDEA has Maven built-in. To run your project:

1. **Open Maven Tool Window:**
   - View → Tool Windows → Maven (or click Maven tab on right side)

2. **Build the project:**
   - Expand "Lifecycle"
   - Double-click `clean`
   - Double-click `install`

3. **Run the application:**
   - Navigate to `src/main/java/org/student/ClassroomApplication.java`
   - Right-click → Run 'ClassroomApplication'

---

## Manual Maven Installation (For Command Line)

### Step 1: Download Maven

1. Go to: https://maven.apache.org/download.cgi
2. Download **Binary zip archive** (apache-maven-3.9.x-bin.zip)
3. Extract to: `C:\Program Files\Apache\maven`

### Step 2: Set Environment Variables

1. **Open Environment Variables:**
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"

2. **Create MAVEN_HOME:**
   - Under "System variables" → Click "New"
   - Variable name: `MAVEN_HOME`
   - Variable value: `C:\Program Files\Apache\maven`

3. **Update PATH:**
   - Find "Path" in System variables → Click "Edit"
   - Click "New"
   - Add: `%MAVEN_HOME%\bin`
   - Click OK on all windows

### Step 3: Verify Installation

Open a NEW PowerShell/CMD window:
```bash
mvn --version
```

You should see Maven version info.

---

## Alternative: Install via Chocolatey

### Install Chocolatey (if not installed)

Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Install Maven

```powershell
choco install maven -y
```

Close and reopen PowerShell, then verify:
```bash
mvn --version
```

---

## Alternative: Install via Scoop

### Install Scoop (if not installed)

Open PowerShell and run:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Install Maven

```powershell
scoop install maven
```

---

## Running Your Project

Once Maven is installed:

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

---

## Troubleshooting

### "mvn not recognized" after installation
- Close and reopen your terminal
- Verify PATH includes `%MAVEN_HOME%\bin`
- Restart your computer if needed

### Java not found
Maven requires Java. Verify Java is installed:
```bash
java -version
```

If not installed, download from: https://www.oracle.com/java/technologies/downloads/#java21

---

## Recommended: Use IntelliJ

For the smoothest experience, just use IntelliJ's built-in Maven. It's already configured and ready to use!
