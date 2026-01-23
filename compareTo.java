public class compareTo {
    public static int compareStrings(String a, String b) {
        int lenA = a.length();
        int lenB = b.length();
        int minLen = Math.min(lenA, lenB);
        for(int i=0; i<minLen;i++){
            char charA =a.charAt(i);
            char charB =b.charAt(i);
            if(charA != charB){
                return charA-charB;
            }
        }
        return -1; // Strings are equal
    }

    public static void main(String[] args) {
        String a = "apple";   
        String b = "banana";
        System.out.println(compareStrings(b,a)); // Output will be negative since "apple" < "banana"
    
        String s = "88778";
        long sum = 0; // Use long to avoid overflow for large numbers

        for(int i = 0; i < s.length(); i++) {
            for(int j = i; j < s.length(); j++) {
                String sub = s.substring(i, j + 1); // Get substring
                sum += Integer.parseInt(sub);       // Convert and add to sum
            }
        }
        System.out.println("Sum of all substrings: " + sum);
    }
}