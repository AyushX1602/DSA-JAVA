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
    }
}