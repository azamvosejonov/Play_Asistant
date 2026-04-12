"""
AAB (Android App Bundle) faylini parse qilish
Versiya ma'lumotlarini olish
"""
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, Optional

def extract_version_from_aab(aab_file_path: str) -> Dict[str, any]:
    """
    AAB faylidan versiya ma'lumotlarini olish
    
    Returns:
        {
            'version_code': int,
            'version_name': str,
            'package_name': str,
            'min_sdk': int,
            'target_sdk': int
        }
    """
    try:
        with zipfile.ZipFile(aab_file_path, 'r') as zip_file:
            # AndroidManifest.xml ni topish
            manifest_path = None
            for file_name in zip_file.namelist():
                if 'AndroidManifest.xml' in file_name:
                    manifest_path = file_name
                    break
            
            if not manifest_path:
                raise Exception("AndroidManifest.xml topilmadi")
            
            # Manifest faylni o'qish
            manifest_data = zip_file.read(manifest_path)
            
            # Binary XML ni parse qilish (base64 encoding)
            # AAB ichida manifest binary formatda
            # Buni o'qish uchun aapt2 yoki bundletool kerak
            
            # Hozircha oddiy XML parse qilamiz
            # (Production'da bundletool ishlatish kerak)
            try:
                root = ET.fromstring(manifest_data)
                
                # Namespace
                ns = {'android': 'http://schemas.android.com/apk/res/android'}
                
                # Version code va name
                version_code = root.get('{http://schemas.android.com/apk/res/android}versionCode')
                version_name = root.get('{http://schemas.android.com/apk/res/android}versionName')
                package_name = root.get('package')
                
                # SDK versiyalari
                uses_sdk = root.find('.//uses-sdk', ns)
                min_sdk = uses_sdk.get('{http://schemas.android.com/apk/res/android}minSdkVersion', '21') if uses_sdk is not None else '21'
                target_sdk = uses_sdk.get('{http://schemas.android.com/apk/res/android}targetSdkVersion', '33') if uses_sdk is not None else '33'
                
                return {
                    'version_code': int(version_code) if version_code else None,
                    'version_name': version_name or 'Unknown',
                    'package_name': package_name or 'Unknown',
                    'min_sdk': int(min_sdk) if min_sdk else 21,
                    'target_sdk': int(target_sdk) if target_sdk else 33,
                    'success': True
                }
            except:
                # Agar XML parse qilish muvaffaqiyatsiz bo'lsa
                # Oddiy ma'lumotlarni qaytaramiz
                return {
                    'version_code': None,
                    'version_name': None,
                    'package_name': None,
                    'min_sdk': None,
                    'target_sdk': None,
                    'success': False,
                    'error': 'Manifest binary formatda. Bundletool kerak.'
                }
                
    except Exception as e:
        return {
            'version_code': None,
            'version_name': None,
            'package_name': None,
            'success': False,
            'error': str(e)
        }

def validate_aab_file(aab_file_path: str) -> Dict[str, any]:
    """
    AAB faylni validatsiya qilish
    """
    try:
        with zipfile.ZipFile(aab_file_path, 'r') as zip_file:
            # Zarur fayllarni tekshirish
            required_files = ['BundleConfig.pb', 'base/manifest/AndroidManifest.xml']
            
            files_in_aab = zip_file.namelist()
            missing_files = []
            
            for req_file in required_files:
                found = any(req_file in f for f in files_in_aab)
                if not found:
                    missing_files.append(req_file)
            
            if missing_files:
                return {
                    'valid': False,
                    'error': f'Kerakli fayllar topilmadi: {", ".join(missing_files)}'
                }
            
            return {
                'valid': True,
                'message': 'AAB fayli to\'g\'ri'
            }
            
    except zipfile.BadZipFile:
        return {
            'valid': False,
            'error': 'Fayl buzilgan yoki AAB emas'
        }
    except Exception as e:
        return {
            'valid': False,
            'error': str(e)
        }
