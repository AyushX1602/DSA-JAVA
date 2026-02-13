public class rowWithMaxSum {
    public static void main(String[] args) {
        int maxSum = Integer.MIN_VALUE;
        int row = -1;
        int [] [] arr = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};// 3 rows and 4 columns

        for(int i=0;i<arr.length;i++){
            int sum = 0;
            for(int j=0;j<arr[0].length;j++){
                sum+= arr[i] [j];
            }
           if(sum>maxSum){
               maxSum = sum;
               row = i;
           }
        }
        System.out.println("Maximum sum of rows: " + maxSum + " at row: " + row);
    }
}
