from exif import Image
import PIL

def get_datetime(filename) -> str:

    # TODO
    return ""

def get_location(filename) -> tuple(float, float):

    try:
        with open(filename, 'rb') as src:
            # TODO
            return (None, None)

    except Exception as err:
        print(err)
        return (None, None)

if __name__ == "__main__":

    try:
        img_path = 'group.jpeg'
        # with open(img_path, 'rb') as src:
        #     img = Image(src)
        #     print (src.name, img)
        
        with open('group.jpeg', "rb") as src:
            img = Image(src)
            if img.has_exif:
                info = f" has the EXIF {img.exif_version}"
            else:
                info = "does not contain any EXIF information"
            print(f"Image {src.name}: {info}")
            print(img.gps_longitude)
            print(img.gps_latitude)
            print(img.datetime)
            print(img.datetime_original)

    except Exception as err:
        print(err)