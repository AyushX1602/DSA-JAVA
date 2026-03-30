public class TwoDArrays {
    public static void main(String[] args) {
        int [] [] arr = new int [3][4]; // 3 rows and 4 columns
        int [] [] arr2 = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}}; // 3 rows and 4 columns

        for (int i = 0;i<arr2.length;i++){
            for (int j = 0; j<arr2[0].length;j++){
                System.out.print(arr2[i][j] + " ");
            }
            System.out.println();
        }
    }
}
