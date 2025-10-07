import java.util.Scanner;

public class arrays {
    public static void main(String[] args) {
        // int [] arr = {1,2,3,4,5};
        // int sum=0;
        // for(int i =0; i<arr.length; i++){
        //     sum = sum + arr[i];
        // }
        // System.out.println("Sum of array elements: " + sum);

        // int [] arr = {1,2,3,4,5};
        // int mult=1;
        // for(int i =0; i<arr.length; i++){
        //     mult = mult * arr[i];
        // }
        // System.out.println("Product of array elements: " + mult);

        // int [] arr = {1,2,3,4,5};
        // int max = arr[0];
        // for(int i = 1; i < arr.length; i++){
        //     if(arr[i] > max){
        //     max = arr[i];
        //     }
        // }
        // System.out.println("Maximum element: " + max);


        // int [] arr = {1,2,3,4,5};
        
        // System.out.println("Modified array:");
        // for(int i = 0; i < arr.length; i++){
        //     if(i % 2 == 0){  // Even index: add 10
        //         arr[i] = arr[i] + 10;
        //     }
        //     else{  // Odd index: multiply by 2
        //         arr[i] = arr[i] * 2;
        //     }
        //     System.out.print(arr[i] + " ");
        // }
        // System.out.println();


        // // Linear Search

        // Scanner sc = new Scanner(System.in);
        // System.out.println("Enter the number of elements in the array:");
        
        // int n = sc.nextInt();
        // int [] arr = new int[n];
        // for(int i = 0; i < n; i++){
        //     arr[i] = sc.nextInt();
        // }
        // System.out.println("Enter the element you want to search:");
        // int x = sc.nextInt();
        // boolean found = false;
        // for(int i = 0; i < n; i++){
        //     if(arr[i] == x){
        //         found = true;
        //         break;
        //     }
        // }
        // if(found){
        //     System.out.println("Element found at position " + (x));
        // }
        // else{
        //     System.out.println("Element not found.");
        // }




        // Two sum 
// Scanner sc = new Scanner(System.in);
// int target = sc.nextInt();
// int[] arr = {2, 7, 11, 15}; 

//         int n = arr.length;
//         for(int i = 0; i < n; i++){
//             for(int j = i + 1; j < n; j++){
//                 if(arr[i] + arr[j] == target){
//                     System.out.println("Indices: " + i + ", " + j);
//                     return;
//                 }
//             }
//         }
//         System.out.println("No solution found");


        //Secound largest element in an array


    //     int[] arr = {5, 3, 8, 1, 4, 7};
    //     int n = arr.length;
    //  //max element
    //     int max = arr[0];
    //     for(int i= 0; i<n; i++){
    //         if(arr[i] > max){
    //             max = arr[i];
    //         }
    //     }
    //     System.out.println("Maximum element: " + max);
    //     //second max element
    //     int secondMax = Integer.MIN_VALUE;
    //     for(int i= 0; i<n; i++){
    //         if(arr[i] > secondMax && arr[i] < max){
    //             secondMax = arr[i];
    //         }
    //     }
    //     System.out.println("Second maximum element: " + secondMax);
            // OR

            // int[] arr = {5, 5, 8, 1, 4, 7};
            // int max =   Integer.MIN_VALUE;
            // int secondMax = Integer.MIN_VALUE;
            // //max
            // for (int i = 0; i < arr.length; i++){
            //     if(arr[i]>max) max= arr[i];
            // }
            // //second max
            // for(int i=0; i<arr.length; i++){
            //     if(arr[i]>secondMax && arr[i]<max) secondMax= arr[i];
            // }
            // System.out.println("Second maximum element: " + secondMax);


            // //Reverse an array
            // int[] reversedArr = {1, 2, 3, 4, 5};
            // int n = reversedArr.length;
            // int i = 0, j = n - 1;
            // while (i < j) {
            //     int temp = reversedArr[i];
            //     reversedArr[i] = reversedArr[j];
            //     reversedArr[j] = temp;
            //     i++;
            //     j--;
            // }
            // for (int element : reversedArr) {
            //     System.out.print(element + " ");
            // }


            //Merge Two Sorted Arrays

    //         int[] arr1 = {2, 6, 9};
    //         int [] arr2 = {1,3, 4, 5, 7, 8};

    //         int [] arr3 = new int [arr1.length + arr2.length];

    //        for(int ele:arr3) System.out.print(ele + " ");
    //        System.out.println();
    //        merge (arr1, arr2, arr3);
    //           for(int ele:arr3) System.out.print(ele + " ");
    //           System.out.println();
    // }
    // public static void merge(int[] arr1, int[] arr2, int[] arr3) {
    //      int i=0,j=0,k=0;
    //      while(i<arr1.length && j<arr2.length) {
    //         if(arr1[i]<arr2[j]) 
    //             arr3[k++] = arr1[i++];
    //           else arr3[k++] = arr2[j++];
    //      }

    //      if(i==arr1.length) {
    //         while(j<arr2.length) {
    //             arr3[k++] = arr2[j++];
    //         }
    //      }
    //      else {
    //         while(i<arr1.length) {
    //             arr3[k++] = arr1[i++];
    //         }
    //     }

        // other way

            int[] arr1 = {2, 6, 9};
            int [] arr2 = {1,3, 4, 5, 7, 8};

            int [] arr3 = new int [arr1.length + arr2.length];

           for(int ele:arr3) System.out.print(ele + " ");
           System.out.println();
           merge (arr1, arr2, arr3);
              for(int ele:arr3) System.out.print(ele + " ");
              System.out.println();
    }
    public static void merge(int[] arr1, int[] arr2, int[] arr3) {
         int i=arr1.length-1,j=arr2.length-1,k=arr3.length-1;
         while(i>=0 && j>=0) {
            if(arr1[i]>arr2[j]) 
                arr3[k--] = arr1[i--];
              else arr3[k--] = arr2[j--];
         }

         if(i==-1) {
            while(j>=0) {
                arr3[k--] = arr2[j--];
            }
         }
         else {
            while(i>=-1) {
                arr3[k--] = arr1[i--];
            }
        }
















    }
}