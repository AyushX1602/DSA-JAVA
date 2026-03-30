import java.util.Scanner;
public class TwoDArrays {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int sum = 0;
        int max = Integer.MIN_VALUE;
        int [] [] arr = new int [3][4]; // 3 rows and 4 columns
        int [] [] arr2 = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}}; // 3 rows and 4 columns

        // for (int i = 0; i < arr.length; i++) {
        //     for (int j = 0; j < arr[0].length; j++) {
        //         arr[i][j] = sc.nextInt(); // Take input first
        //         sum += arr[i][j]; // Add the value to sum
        //     }
        //     System.out.println();
        // }

         for (int i = 0; i < arr2.length; i++) {
            for (int j = 0; j < arr2[0].length; j++) {
                System.out.print(arr2[i][j] + " ");
                sum += arr2[i][j]; // Add the value to sum
            }
            System.out.println();
        }

        for (int i = 0; i < arr2.length; i++) {
            for (int j = 0; j < arr2[0].length; j++) {
                System.out.print(arr2[i][j] + " ");
                if (arr2[i][j] > max) {
                    max = arr2[i][j];
                }
            }
            System.out.println();
        }
        System.out.println("Sum of all elements: " + sum);
        System.out.println("Maximum element: " + max);
    }
}
