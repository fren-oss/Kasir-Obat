#!/usr/bin/env python3
"""Generate PWA icons for Kasir Obat"""

try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠️  PIL/Pillow not available. Installing...")

import subprocess
import sys
import os

def install_pillow():
    """Install Pillow if not available"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
        print("✅ Pillow installed successfully")
        return True
    except:
        print("❌ Failed to install Pillow")
        return False

def create_icon(size, output_path):
    """Create a medical-themed icon"""
    # Create image with rounded corners
    img = Image.new('RGB', (size, size), color='#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Medical cross (white)
    cross_size = int(size * 0.47)
    cross_thickness = int(size * 0.16)
    center = size // 2
    
    # Horizontal bar
    x1 = center - cross_size // 2
    y1 = center - cross_thickness // 2
    x2 = center + cross_size // 2
    y2 = center + cross_thickness // 2
    draw.rectangle([x1, y1, x2, y2], fill='white')
    
    # Vertical bar
    x1 = center - cross_thickness // 2
    y1 = center - cross_size // 2
    x2 = center + cross_thickness // 2
    y2 = center + cross_size // 2
    draw.rectangle([x1, y1, x2, y2], fill='white')
    
    # Plus symbol in corner (green circle)
    plus_x = int(size * 0.78)
    plus_y = int(size * 0.22)
    plus_radius = int(size * 0.12)
    
    # Draw circle
    draw.ellipse([
        plus_x - plus_radius,
        plus_y - plus_radius,
        plus_x + plus_radius,
        plus_y + plus_radius
    ], fill='#10b981')
    
    # Plus sign (white)
    plus_size = int(plus_radius * 0.6)
    plus_thick = int(plus_radius * 0.27)
    
    # Horizontal
    draw.rectangle([
        plus_x - plus_size // 2,
        plus_y - plus_thick // 2,
        plus_x + plus_size // 2,
        plus_y + plus_thick // 2
    ], fill='white')
    
    # Vertical
    draw.rectangle([
        plus_x - plus_thick // 2,
        plus_y - plus_size // 2,
        plus_x + plus_thick // 2,
        plus_y + plus_size // 2
    ], fill='white')
    
    # Save
    img.save(output_path, 'PNG', optimize=True)
    return True

def main():
    print("🏥 Generating PWA Icons for Kasir Obat...")
    print("")
    
    # Check/install Pillow
    if not PIL_AVAILABLE:
        if install_pillow():
            # Reload PIL
            from PIL import Image, ImageDraw
        else:
            print("❌ Cannot generate icons without Pillow")
            print("Please install manually: pip3 install Pillow")
            return False
    
    # Create public directory if not exists
    public_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    # Generate icons
    sizes = [192, 512]
    
    for size in sizes:
        output_path = os.path.join(public_dir, f'icon-{size}.png')
        print(f"📦 Generating {size}x{size} icon...")
        
        if create_icon(size, output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ Created: {output_path} ({file_size:,} bytes)")
        else:
            print(f"❌ Failed to create {size}x{size} icon")
            return False
    
    print("")
    print("✅ All icons generated successfully!")
    print("")
    print("📂 Icons saved to:")
    print(f"   - public/icon-192.png")
    print(f"   - public/icon-512.png")
    print("")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
