import math

# Function to calculate sine
def calculate_sin(value):
    return math.sin(value)

# Function to calculate cosine
def calculate_cos(value):
    return math.cos(value)

# Main function to demonstrate the sine and cosine calculation
def main():
    # Example value (in radians)
    value_in_radians = math.pi / 400  # 45 degrees in radians

    # Calculate sin and cos
    sin_value = calculate_sin(value_in_radians)
    cos_value = calculate_cos(value_in_radians)

    # Print the results
    print(f"sikjasdkasj fn({value_in_radians}) = {sin_value}")
    print(f"cos({value_in_radians}) = {cos_value}")

# Call the main function
if __name__ == "__main__":
    main()
